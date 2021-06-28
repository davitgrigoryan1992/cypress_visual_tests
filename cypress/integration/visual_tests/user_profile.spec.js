import DashboardPage from "../../pages/DashboardPage";
import MyProfilePage from "../../pages/MyProfilePage";

let dashboardPage = new DashboardPage()
let myProfilePage = new MyProfilePage()

describe('User info items visual tests', () => {
    before(() => {
        cy.seedDatabaseWithCleanData()
    });

    afterEach(() => {
        cy.seedDatabaseWithCleanData()
     });

    [
        {
            user:
                {
                    role: 'owner'
                }
        },
        {
            user:
                {
                    role: 'member'
                }
        },
        {
            user:
                {
                    role: 'admin'
                }
        }
    ].forEach(test => {

        it(`${test.user.role} | Check users' account information items' content rendered correctly`, () => {
            cy.login(test.user.role)
            cy.visit('/dashboard')
            dashboardPage.presentationItems()
                .should('be.visible')
            dashboardPage.userProfileBtn().click()
            cy.percySnapshot(`${test.user.role}'s_info_settings_menu`)
            dashboardPage.userDropdownItems().contains('My profile').click()
            myProfilePage.userAccountAvatar()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_info_account_information_page`)
            myProfilePage.firstNameInput().clear()
            cy.percySnapshot(`${test.user.role}'s_enabled_update_btn`)
            myProfilePage.updateSettingsBtn().click()
            cy.percySnapshot(`${test.user.role}'s_info_empty_field_error_message`)
            myProfilePage.firstNameInput().type('BUM1')
            myProfilePage.updateSettingsBtn().click()
            myProfilePage.updateAlert()
                .should('be.visible')
                .and('contain.text', 'Success')
            cy.percySnapshot(`${test.user.role}'s_info_update_success_alert`)
        });

        it(`${test.user.role} | Check users' change password items' content rendered correctly`, () => {
            const password = 'test1'
            const currentPassword = Cypress.env("SC_PASSWORD")
            cy.login(test.user.role)
            cy.visit('/dashboard')
            dashboardPage.userProfileBtn().click()
            dashboardPage.userDropdownItems().contains('My profile').click()
            myProfilePage.profileSettingsItems().contains('Change password').click()
            cy.percySnapshot(`${test.user.role}'s_password_update_change_password_page`)
            myProfilePage.currentPasswordInputField().type(password)
            myProfilePage.changePasswordBtn().click()
            cy.contains('This field is required')
            cy.percySnapshot(`${test.user.role}'s_password_update_empty_password_fields_error_messages`)
            myProfilePage.newPasswordField().type(password)
            myProfilePage.confirmPasswordField().type(password)
            myProfilePage.changePasswordBtn().click()
            myProfilePage.updateAlert()
                .should('be.visible')
                .and('contain.text', 'Error')
            cy.percySnapshot(`${test.user.role}'s_password_update_error_alert`)
            myProfilePage.currentPasswordInputField().type(currentPassword)
            myProfilePage.newPasswordField().type(password)
            myProfilePage.confirmPasswordField().type(password)
            myProfilePage.changePasswordBtn().click()
            myProfilePage.updateAlert()
                .should('be.visible')
                .and('contain.text', 'Success')
            cy.percySnapshot(`${test.user.role}'s_password_update_success_alert`)
        });
    });
    [
        {
            user:
                {
                    role: 'owner'
                }
        },
        {
            user:
                {
                    role: 'admin'
                }
        }
    ].forEach(test => {

        it(`${test.user.role} | Check users page rendered correctly`, () => {
            const email = 'example@slidecamp.io'
            cy.login(test.user.role)
            cy.visit('/dashboard')
            dashboardPage.userProfileBtn().click()
            dashboardPage.userDropdownItems().contains('My profile').click()
            myProfilePage.profileSettingsItems().contains('User').click()
            myProfilePage.userStatusDropdown().contains('Status').click()
            myProfilePage.userStatusDropdownItems()
                .should('contain', 'Everyone')
            cy.percySnapshot(`${test.user.role}'s_users_user_invitation_status_dropdown`)
            myProfilePage.userStatusDropdown().contains('Role').click()
            myProfilePage.userStatusDropdownItems()
                .should('contain', 'Admin')
            cy.percySnapshot(`${test.user.role}'s_users_user_role_dropdown`)
            myProfilePage.usersSettingsBtn().eq(2).click()
            myProfilePage.userSettingsDropdownItems()
                .should('contain', 'Resend invitation')
            cy.percySnapshot(`${test.user.role}'s_users_user_setting_dropdown`)
            myProfilePage.usersSettingsBtn().eq(0).click()
            myProfilePage.userSettingsDropdownItems().eq(0).click()
            myProfilePage.changeRoleModal()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_users_change_role_modal`)
            myProfilePage.changeRoleModalCloseBtn().click()
            myProfilePage.usersSettingsBtn().eq(0).click()
            myProfilePage.userSettingsRemoveItem().contains('Remove from team').click()
            myProfilePage.removeUserModal()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_users_remove_user_modal`)
            myProfilePage.inviteNewUserBtn().contains('Confirm').click()
            myProfilePage.removeUserModal()
                .should('not.exist')
            myProfilePage.inviteNewUserBtn().click()
            myProfilePage.inviteNewUserModal()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_users_invite_new_user_modal`)
            myProfilePage.inviteUserBtn().contains('Invite').click()
            myProfilePage.inviteNewUserModal()
                .should('contain', 'Invalid email address')
            cy.percySnapshot(`${test.user.role}'s_users_invite_user_invalid_email_error_message`)
            myProfilePage.inviteUserEmailInputs().type(email)
            myProfilePage.checkMark()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_users_invite_user_checked_correct_email`)
            myProfilePage.addAnotherUserBtn().contains('Add another').click()
            myProfilePage.inviteUserEmailInputs()
                .should('have.length', 2)
            cy.percySnapshot(`${test.user.role}'s_users_invite_another_user_field`)
            myProfilePage.addAnotherUserBtn().contains('add many at once').click()
            myProfilePage.inviteManyUsersEmailInput()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_users_invite_many_users_modal`)
            myProfilePage.inviteManyUsersEmailInput().clear()
            myProfilePage.inviteUserBtn().contains('Invite').click()
            myProfilePage.inviteNewUserModal()
                .should('contain', 'Please enter multiple valid email addresses')
            cy.percySnapshot(`${test.user.role}'s_users_invite_many_users_empty_field_error_message`)
            myProfilePage.inviteManyUsersEmailInput().type(email)
            myProfilePage.inviteUserBtn().contains('Invite').click()
            myProfilePage.inviteNewUserModal()
                .should('contain', 'Your invitations were successfully sent')
            cy.percySnapshot(`${test.user.role}'s_users_successful_invitation_message`)
        });

        it(`${test.user.role} | Check teams page rendered correctly`, () => {
            const name = 'Team'
            const purpose = 'Research'
            cy.login(test.user.role)
            cy.visit('/dashboard')
            dashboardPage.userProfileBtn().click()
            dashboardPage.userDropdownItems().contains('My profile').click()
            myProfilePage.profileSettingsItems().contains('Teams').click()
            myProfilePage.teamsBox()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_teams_page`)
            myProfilePage.teamsBox().eq(1).click()
            cy.contains('all Team')
            cy.percySnapshot(`${test.user.role}'s_teams_all_team_page`)
            myProfilePage.allTeamPresentationMeatballsMenu().click()
            cy.contains('Unshare')
            cy.percySnapshot(`${test.user.role}'s_teams_all_team_presentation_meatballs_menu`)
            myProfilePage.teamsGoBackBtn().click()
            myProfilePage.addNewTeamBtn().click()
            myProfilePage.createTeamModal()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_teams_create_team_modal`)
            myProfilePage.createTeamModalInputs().eq(2).click({force: true})
            myProfilePage.createTeamModalUsers()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_teams_create_team_modal_user_dropdown`)
            myProfilePage.createTeamModalUsers().eq(0).click()
            myProfilePage.createTeamModalInputs().eq(0).click()
            myProfilePage.selectedTeamMembers()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_teams_create_team_modal_selected_user`)
            myProfilePage.createTeamModalInputs().eq(0).type(name)
            myProfilePage.createTeamModalInputs().eq(1).type(purpose)
            myProfilePage.saveCreateTeamBtn().contains('Save')
                .should('not.be.disabled')
            cy.percySnapshot(`${test.user.role}'s_teams_create_team_modal_enabled_save_btn`)
            myProfilePage.saveCreateTeamBtn().contains('Save').click()
            cy.reload()
            myProfilePage.teamsBox()
                .should('be.visible')
                .and('have.length', 3)
            cy.percySnapshot(`${test.user.role}'s_teams_three_team_boxes`)
            myProfilePage.deleteTeamBtn().click()
            myProfilePage.deleteTeamModal()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_teams_team_remove_modal`)
        });
    });
        [
            {
                user:
                    {role: 'owner'}
            }
        ].forEach((test) => {

        it(`${test.user.role} | Check invoice details rendered correctly`, () => {
            const name = 'Bartek'
            const email = 'example@slidecamp.io'
            const companyName = 'Slidecamp'
            const detailsText = 'Invoice details'
            cy.login(test.user.role)
            cy.visit('/dashboard')
            dashboardPage.userProfileBtn().click()
            dashboardPage.userDropdownItems().contains('My profile').click()
            myProfilePage.profileSettingsItems().contains('Billing information').click()
            myProfilePage.editDetailsBtn()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_bil_info_billing_information_page`)
            myProfilePage.editDetailsBtn().eq(1).click()
            myProfilePage.detailsTextarea()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_bil_info_invoice_details_page`)
            myProfilePage.updateDetailsBtn().click()
            cy.contains('This field is required')
            cy.percySnapshot(`${test.user.role}'s_bil_info_invoice_details_empty_fields_error_messages`)
            myProfilePage.invoiceItems().eq(0).type(name)
            myProfilePage.invoiceItems().eq(1).type(email)
            myProfilePage.invoiceItems().eq(2).type(companyName)
            myProfilePage.detailsTextarea().type(detailsText)
            myProfilePage.updateDetailsBtn().click()
            myProfilePage.updateAlert()
                .should('be.visible')
                .and('contain.text', 'Success')
            cy.percySnapshot(`${test.user.role}'s_bil_info_invoice_details_update_success_alert`)
        });

        it(`${test.user.role} | Check cancel subscription rendered correctly`, () => {
            cy.login(test.user.role)
            cy.visit('/dashboard')
            dashboardPage.userProfileBtn().click()
            dashboardPage.userDropdownItems().contains('My profile').click()
            myProfilePage.profileSettingsItems().contains('Billing information').click()
            myProfilePage.cancelSubscriptionBtn().click()
            myProfilePage.cancelSubscriptionModal()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_bil_info_cancel_subscription_modal`)
            myProfilePage.cancelSubscriptionModal().contains('Cancel subscription').click()
            cy.contains('Skip questions')
            cy.percySnapshot(`${test.user.role}'s_bil_info_cancellation_reason_modal`)
            myProfilePage.chosenCancellationReason().eq(2).click()
            myProfilePage.chosenCancellationReason().eq(0)
                .should('not.be.checked')
            cy.percySnapshot(`${test.user.role}'s_bil_info_checked_cancellation_reason`)
            myProfilePage.cancelSubscriptionModal().contains('Submit answer').click()
            myProfilePage.cancelSubscriptionModal()
                .should('not.exist')
            cy.percySnapshot(`${test.user.role}'s_bil_info_upgrade_subscription_btn`)
            myProfilePage.editDetailsBtn().eq(0).click()
            cy.contains('productivity today')
            cy.percySnapshot(`${test.user.role}'s_bil_info_subscription_pricing_page`)
        });

        it(`${test.user.role} | Check change plan rendered correctly`, () => {
            cy.login(test.user.role)
            cy.visit('/dashboard')
            dashboardPage.userProfileBtn().click()
            dashboardPage.userDropdownItems().contains('Change plan').click()
            myProfilePage.changePlanOptionWindows()
                .should('be.visible')
            cy.percySnapshot(`${test.user.role}'s_change_plan_page`)
        });
    });
});
