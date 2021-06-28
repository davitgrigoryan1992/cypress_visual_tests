import DashboardPage from "../../../pages/DashboardPage";
import PresentationPage from "../../../pages/PresentationPage";
import ActivityPage from "../../../pages/ActivityPage";
import MyProfilePage from "../../../pages/MyProfilePage";

let dashboardPage = new DashboardPage()
let presentationPage = new PresentationPage()
let activityPage = new ActivityPage()
let myProfilePage = new MyProfilePage()

describe('User activity tests', () => {
    beforeEach(() => {
        cy.seedDatabaseWithCleanData()

    });

    after(() => {
        cy.seedDatabaseWithCleanData()
    });

    [
        {
            user:
                {
                    role: 'member',
                    page: '/presentations'
                }
        },
        {
            user:
                {
                    role: 'admin',
                    page: '/shared'
                }
        }
    ].forEach((test) => {
        it(`${test.user.role} | Check activity when sharing link`, () => {
            cy.login(test.user.role)
            cy.visit(test.user.page)
            presentationPage.presentationItems().eq(0).find('span').then((elem) => {
                let presentationName = elem.text()
                presentationPage.presentationMeatballsMenu().eq(0).click()
                presentationPage.presentationActionMenuItems().contains('Share').click()
                presentationPage.sharePresentationModal()
                    .should('be.visible')
                presentationPage.sharePresentationModal().contains('Copy')
                    .invoke('attr', 'class')
                    .should('not.contain', 'copy-active')
                cy.intercept('POST', '/graphql').as("LinkToBeShared")
                presentationPage.sharePresentationModal().find('input').last().check({force: true})
                cy.wait('@LinkToBeShared')
                cy.wait(1000)
                presentationPage.sharePresentationModal().contains('Copy')
                    .invoke('attr', 'class')
                    .should('contain', 'copy-active')
                presentationPage.shareLink().then((link) => {
                    cy.logout()
                    cy.visit(link.text())
                })
                presentationPage.slideViewer()
                    .should('be.visible')
                cy.login(test.user.role)
                cy.visit('/activity')
                activityPage.activityCards()
                    .should('be.visible')
                    .and('contain.text', `Viewer from unknown location opened ${presentationName}`)
            })
        });
    });

    [
        {
            user:
                {
                    role: 'owner',
                    page: '/presentations'
                }
        },
        {
            user:
                {
                    role: 'admin',
                    page: '/shared'
                }
        }
    ].forEach((test) => {

        it(`${test.user.role} | Check activity when inviting new member`, () => {
            let email = activityPage.email
            cy.login(test.user.role)
            cy.visit('/myprofile/myteam')
            dashboardPage.userProfileBtn().click()
            dashboardPage.userName().then(el => {
                cy.wrap(el.text()).as('userName')
            })
            myProfilePage.inviteNewUserBtn().contains('Invite new user').click()
            myProfilePage.inviteNewUserModal()
                .should('be.visible')
            myProfilePage.inviteUserEmailInputs().type(email)
            myProfilePage.checkMark()
                .should('be.visible')
            myProfilePage.inviteUserBtn().contains('Invite').click()
            myProfilePage.successfulInvitationModal()
                .should('contain.text', email)
            cy.visit('/activity')
            cy.get('@userName').then(name => {
                activityPage.activityCards()
                    .should('be.visible')
                    .and('contain.text', `${name}  invited ${email} to Slidecamp`)
            })

        });

        it(`${test.user.role} | Check activity when sharing presentation`, () => {
            cy.login(test.user.role)
            cy.visit(test.user.page)
            dashboardPage.userProfileBtn().click()
            dashboardPage.userName().then(el => {
                cy.wrap(el.text()).as('userName')
            })
            presentationPage.presentationItems().eq(0).find('span').then((elem) => {
                let presentationName = elem.text()
                presentationPage.presentationMeatballsMenu().eq(0).click()
                presentationPage.presentationActionMenuItems().contains('Share').click()
                presentationPage.sharePresentationModal()
                    .should('be.visible')
                presentationPage.sharePresentationInput().click()
                presentationPage.shareUserDropdown().contains('Bartek Bum2').wait(500).click()
                dashboardPage.shareWithItems().then((elem) => {
                    let sharedWithName = elem.text()
                    presentationPage.shareSaveBtn().click()
                    cy.visit('/activity')
                    cy.get('@userName').then(name => {
                        activityPage.activityCards()
                            .should('be.visible')
                            .and('contain.text', `${name} shared ${presentationName} with ${sharedWithName}`)
                    })
                    if (test.user.role !== "admin") {
                        cy.visit(test.user.page)
                        presentationPage.presentationMeatballsMenu().eq(0).click()
                        presentationPage.presentationActionMenuItems().contains('Share').click()
                        presentationPage.sharePresentationModal()
                            .should('be.visible')
                        presentationPage.removeSharedMember().click()
                        presentationPage.shareSaveBtn().click()
                        cy.visit('/activity')
                        cy.get('@userName').then(name => {
                            activityPage.activityCards().eq(0)
                                .should('be.visible')
                                .and('contain.text', `${name} stopped sharing ${presentationName} with ${sharedWithName}`)
                        })
                    }
                })
            })
        });
    });

    [
        {
            user:
                {
                    role: 'owner',
                }
        },
    ].forEach((test) => {

        it(`${test.user.role} | Check activity when searching`, () => {
            let searchItem1 = activityPage.searchItem1
            let searchItem2 = activityPage.searchItem2
            cy.login('member')
            cy.visit('/dashboard')
            dashboardPage.searchInput().type(searchItem1)
            dashboardPage.searchBtn().click()
            cy.contains('SEARCH NOT FOUND')
            cy.visit('/dashboard')
            dashboardPage.searchInput().type(searchItem2)
            dashboardPage.searchBtn().click()
            cy.contains(`Filter results for '${searchItem2}'`)
            activityPage.searchResult().find('img')
                .invoke('attr', 'src').then(imgUrl => {
                const pictureLink = imgUrl
                cy.logout()
                cy.login(test.user.role)
                cy.visit('/activity')
                activityPage.activityCards().eq(0)
                    .should('be.visible')
                    .and('contain.text', `Bartek Bum2 searched for ${searchItem2} and received 1 results`)
                activityPage.activityCards().eq(1)
                    .should('be.visible')
                    .and('contain.text', `Bartek Bum2 searched for ${searchItem1} and received 0 results`)
                activityPage.activityCards().eq(0).click()
                activityPage.activityResult().find('img')
                    .invoke('attr', 'src')
                    .should('deep.equal', pictureLink)
            })
        });
    });
});
