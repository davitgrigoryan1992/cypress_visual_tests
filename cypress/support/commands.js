import '@percy/cypress';
import 'cypress-file-upload';
import TemplatePage from "../pages/TemplatePage";

let templatePage = new TemplatePage();

Cypress.Commands.add("login", (role = "owner") => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        body: {
            query:
                "mutation login($email: String!, $password: String!, $timezoneOffset: Int) { login(email: $email, password: $password, timezoneOffset: $timezoneOffset) }",
            variables: {
                timezoneOffset: -60,
                email: role === "owner" ? Cypress.env("SC_EMAIL_TEAM_OWNER") : role === "member" ? Cypress.env("SC_EMAIL_TEAM_MEMBER") : Cypress.env("SC_EMAIL_ADMIN"),
                password: Cypress.env("SC_PASSWORD")
            }
        }
    }).then(resp => {
        localStorage.setItem("jwtToken", resp.body.data.login)
    })
})

Cypress.Commands.add("addCategory", (name) => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: {
            operationName: "createPresentation",
            query:
                "mutation createPresentation($data: PresentationInput!) {createPresentation(data: $data) {id name __typename }}",
            variables: {
                data: {
                    icon: "Presentation",
                    name: name
                }
            }
        }
    }).then(resp => {
        expect(resp.status).to.eq(200)
        return resp.body
    })
})

Cypress.Commands.add("archiveCategory", (id) => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: {
            operationName: "archiveTeamTemplateBatch",
            query:
                "mutation archiveTeamTemplateBatch($batchId: String, $data: TeamBatchUpdateInput!) {session {updateTeamTemplateBatch(batchId: $batchId, data: $data) {id batchId deleted __typename} __typename}}",
            variables: {
                batchId: id,
                data: {
                    deleted: true,
                }
            }
        }
    }).then(resp => {
        expect(resp.status).to.eq(200)
    })
})

Cypress.Commands.add("seedDatabaseWithCleanData", () => {
    cy.request(Cypress.env("SC_SEED_URL"))
})

Cypress.Commands.add("uploadFile", (file) => {
    cy.fixture(file, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then(fileContent => {
            cy.get('div:nth-child(1) > div > input[type=file]').attachFile({
                fileContent,
                fileName: file,
                mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                encoding: 'utf-8',
            })
        })
})

Cypress.Commands.add('replaceFile', {
    prevSubject: 'element'
}, (subject, file) => {
    cy.fixture(file, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then(fileContent => {
            cy.wrap(subject).attachFile({
                fileContent,
                fileName: file,
                mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                encoding: 'utf-8',
            })
        })
})


//Will use in future tests
Cypress.Commands.add("getFileSize", (file) => {
    cy.fixture(file, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then(fileContent => {
            let _size = fileContent.size
            let fSExt = ['Bytes', 'KB', 'MB', 'GB'],
                i = 0
            while (_size > 900) {
                _size /= 1024
                i++
            }
            return (Math.round(_size * 100) / 100) + ' ' + fSExt[i];
        })
})

// TODO: replace me with clickAndCheckFileDownloadSucceedAndIfFileIsTheSame or clickAndCheckFileDownloadSucceedAndIfFileIsDifferent
Cypress.Commands.add("clickAndCheckFileDownloadSucceed", {
    prevSubject: 'element'
}, (downloadBtn) => {

    // there is a bug in cypress related to file downloads, so we need to add this event listener
    // based on https://github.com/cypress-io/cypress/issues/14857#issuecomment-790765826

    cy.window().document().then(function (doc) {

        doc.addEventListener('click', () => {
            setTimeout(function () { doc.location.reload() }, 5000)
        })

        cy.intercept(`https://storage.googleapis.com/**`).as('fileDownload')
        cy.wrap(downloadBtn).click()
        cy.wait('@fileDownload', { timeout: 20000 }).its('response.statusCode').should('eq', 200)

    })

})

Cypress.Commands.add("clickAndCheckFileDownloadSucceedAndIfFileIsTheSame", {
    prevSubject: 'element'
}, (downloadBtn, actualFile, expectedFile) => {

    // there is a bug in cypress related to file downloads, so we need to add this event listener
    // based on https://github.com/cypress-io/cypress/issues/14857#issuecomment-790765826

    cy.window().document().then(function (doc) {

        doc.addEventListener('click', () => {
            setTimeout(function () { doc.location.reload() }, 5000)
        })

        cy.intercept(`https://storage.googleapis.com/**`).as('fileDownload')
        cy.wrap(downloadBtn).click()
        cy.wait('@fileDownload', { timeout: 20000 }).its('response.statusCode').should('eq', 200)

        cy.readFile(`cypress/downloads/${expectedFile}`).then((file1) => {
            cy.readFile(`cypress/fixtures/${actualFile}`).then((file2) => {
                const result = file1 === file2
                expect(result).to.be.true
            })
        })

    })

})

Cypress.Commands.add("clickAndCheckFileDownloadSucceedAndIfFileIsDifferent", {
    prevSubject: 'element'
}, (downloadBtn, actualFile, expectedFile) => {

    // there is a bug in cypress related to file downloads, so we need to add this event listener
    // based on https://github.com/cypress-io/cypress/issues/14857#issuecomment-790765826

    cy.window().document().then(function (doc) {

        doc.addEventListener('click', () => {
            setTimeout(function () { doc.location.reload() }, 5000)
        })

        cy.intercept(`https://storage.googleapis.com/**`).as('fileDownload')
        cy.wrap(downloadBtn).click()
        cy.wait('@fileDownload', { timeout: 20000 }).its('response.statusCode').should('eq', 200)

        cy.readFile(`cypress/downloads/${expectedFile}`).then((file1) => {
            cy.readFile(`cypress/fixtures/${actualFile}`).then((file2) => {
                const result = file1 === file2
                expect(result).not.to.be.true
            })
        })

    })

})

Cypress.Commands.add("moveCartSlideToEnd", {
    prevSubject: 'element'
}, (toChange) => {
    cy.wait(500);
    cy.wrap(toChange).trigger('dragstart')
    cy.get('[class="cart-footer"] ').trigger('drop')
    cy.wait(500);
    cy.get('[class="cart-footer"] ').trigger('dragend');
})

Cypress.Commands.add("logout", () => {
    cy.clearLocalStorage()
    cy.reload()
})

Cypress.Commands.add("hoverOverSlide", {
    prevSubject: 'element'
}, (elem) => {
    cy.wrap(elem).find('[class="uploaded-slide-prev text-center "]').realHover()
})

Cypress.Commands.add("shareFirstPresentationWithAll", (name) => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: {
            operationName: "setBatchSharing",
            query:
                "mutation setBatchSharing($batchId: String!, $data: BatchUpdateInput!, $addedUnitIds: [String!] = [], $removedUnitIds: [String!] = [], $addedMemberIds: [String!] = [], $removedMemberIds: [String!] = []) { session { addedBatchSharing: setBatchSharing(unitIds: $addedUnitIds, memberIds: $addedMemberIds, batchId: $batchId, state: true) removedBatchSharing: setBatchSharing(unitIds: $removedUnitIds, memberIds: $removedMemberIds, batchId: $batchId, state: false) shareExternally: updateBatch(batchId: $batchId, data: $data) { id batchId shareWithLink sharedForMembers { id memberId firstName lastName accepted email __typename } sharedForUnits { id unitId name __typename } __typename } __typename }}",
            variables: {
                "addedUnitIds": ["all"],
                "removedUnitIds": [],
                "addedMemberIds": [],
                "removedMemberIds": [],
                "batchId": "65d0e844-5656-4403-a361-57059ba51e22",
                "data": {}
            }
        }
    }).then(resp => {
        expect(resp.status).to.eq(200)
        return resp.body
    })
})

Cypress.Commands.add("addInvoice", (contact_person, email, companyName, company_details) => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: {
            operationName: "setBillingData",
            query:
                "mutation setBillingData($contactPerson: String, $email: String, $companyName: String, $companyDetails: String) { session { setBillingData(contactPerson: $contactPerson, email: $email, companyName: $companyName, companyDetails: $companyDetails) {userId billingData { contactPerson email companyName companyDetails __typename } __typename } __typename } }",
            variables: {
                companyDetails: company_details,
                companyName: companyName,
                contactPerson: contact_person,
                email: email
            }
        }
    }).then(resp => {
        expect(resp.status).to.eq(200)
    })
})

Cypress.Commands.add("inviteNewUser", (email) => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: {
            operationName: "addUserToMyTeam",
            query:
                "mutation addUserToMyTeam($emails: [String!]!) { session { addUserToMyTeam(emails: $emails) { id members { id memberId firstName lastName email accepted __typename } __typename } __typename } } ",
            variables: {
                email: [email],
                emails: [email],
                0: email
            },
        }
    }).then(resp => {
        expect(resp.status).to.eq(200)
    })
})

Cypress.Commands.add("createNewTeam", (teamName, purpose) => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: {
            operationName: "createUnit",
            query:
                "mutation createUnit($data: CreateUnitData!) { session { createUnit(data: $data) { id unitId __typename } __typename } } ",
            variables: {
                data: {
                    name: teamName,
                    description: purpose
                }
            },
        }
    }).then(resp => {
        expect(resp.status).to.eq(200)

    })
})

Cypress.Commands.add("createNewPlan", (amount, description, interval, name, id, teammembers) => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: {
            operationName: "createPlan",
            query:
                "mutation createPlan($data: CreatePlanInput!) { admin { createPlan(data: $data) { id __typename } __typename } } ",
            variables: {
                data: {
                    amount: amount,
                    description: description,
                    interval: interval,
                    name: name,
                    stripeId: id,
                    teamMembers: teammembers
                }
            },
        }
    }).then(resp => {
        expect(resp.status).to.eq(200)

    })
})

Cypress.Commands.add("createNewGroup", (id, groupName, prefix) => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: {
            operationName: "createGroup",
            query:
                "mutation createGroup($data: CreateGroupInput!) { admin { createGroup(data: $data) { id groupId plans { id name amount interval __typename } urlPrefix searchTags name custom __typename } __typename} } ",
            variables: {
                data: {
                    custom: false,
                    groupId: id,
                    name: groupName,
                    planIds: ["trial"],
                    searchTags: [],
                    urlPrefix: prefix
                }
            },
        }
    }).then(resp => {
        expect(resp.status).to.eq(200)

    })
})

Cypress.Commands.add("createNewColor", (id, colorName) => {
    cy.request({
        method: "POST",
        url: Cypress.env("SC_API_URL"),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: {
            operationName: "createColorVersion",
            query:
                "mutation createColorVersion($data: CreateColorVersionInput!) { admin { createColorVersion(data: $data) { id colorVersionId name hash __typename } __typename } } ",
            variables: {
                data: {
                    colorHash: "FA1100",
                    colorVersionId: id,
                    name: colorName
                }
            },
        }
    }).then(resp => {
        expect(resp.status).to.eq(200)

    })
})

Cypress.Commands.add("uploadSecondFile", (file) => {
    cy.fixture(file, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then(fileContent => {
            cy.get('div:nth-child(1) > div > input[type=file]').eq(1).attachFile({
                fileContent,
                fileName: file,
                mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                encoding: 'utf-8',
            })
        })
})

Cypress.Commands.add("columnResizer", {
    prevSubject: 'element'
}, (toChange) => {
    cy.wait(100);
    cy.wrap(toChange).trigger('mousedown')
    cy.get('[class="rt-resizer"] ').eq(4).trigger('mousemove')
    cy.wait(100);
    cy.get('[class="rt-resizer"] ').eq(2).trigger('mouseleave');
})

Cypress.Commands.add("changeCategoryOrder", {
    prevSubject: 'element'
}, (toChange) => {
    cy.wait(500);
    cy.wrap(toChange).trigger('dragstart')
    cy.get('[class="order-list-cat hover-off"]').eq(1).trigger('dragover', 160, 40)
    cy.get('[class="order-list-cat hover-off"]').eq(1).trigger('dragover', 170, 40)
    cy.get('[class="btn btn-lightblue"]').trigger('drop')
    cy.get('[class="btn btn-lightblue"]').trigger('dragend');
})
