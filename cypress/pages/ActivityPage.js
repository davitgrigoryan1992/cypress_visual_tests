let faker = require('faker')

export default class ActivityPage {
    searchItem1 = faker.lorem.word()
    searchItem2 = 'image'
    email = faker.internet.email()

    activityCards() {
        return cy.get('[class="log-text"]')
    };

    searchResult() {
        return cy.get('[class="image__cell is-expanded"]')
    };

    activityResult() {
        return cy.get('[class="collapse show"]')
    };
}
