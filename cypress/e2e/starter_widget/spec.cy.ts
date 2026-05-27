describe('Starter Widget', () => {
  it('should render the tabbed starter widget', () => {
    cy.get('#starters').should('exist');
    cy.contains('News Assistant').should('be.visible');
    cy.contains('button', 'Trending').should('exist');
    cy.contains('button', 'While you were away').should('exist');
    cy.get('#starter-top-stories').should('exist');
    cy.get('#starter-market-brief').should('not.exist');
  });

  it('should switch tabs and send a starter message', () => {
    cy.contains('button', 'While you were away').should('be.visible').click();
    cy.get('#starter-market-brief').should('exist').click();
    cy.get('.step').should('have.length', 2);
    cy.get('.step').eq(0).contains('Give me the latest market brief');
    cy.get('.step').eq(1).contains('Give me the latest market brief');
  });

  it('should keep starter message autoscroll working with a long starter widget', () => {
    cy.viewport(900, 520);
    cy.get('#starter-top-stories').should('be.visible').click();

    cy.get("[data-step-type='user_message']")
      .contains('Top stories')
      .should(($message) => {
        const rect = $message[0].getBoundingClientRect();
        expect(rect.top).to.be.greaterThan(50);
        expect(rect.top).to.be.lessThan(140);
      });

    cy.get('#message-composer').should(($composer) => {
      const rect = $composer[0].getBoundingClientRect();
      expect(rect.bottom).to.be.lessThan(Cypress.config('viewportHeight'));
    });
  });

  it('should keep user message autoscroll working with a long starter widget', () => {
    cy.viewport(900, 520);
    cy.get('#chat-input')
      .should('be.visible')
      .type('Composer autoscroll check');
    cy.get('#chat-submit').click();

    cy.get("[data-step-type='user_message']")
      .contains('Composer autoscroll check')
      .should(($message) => {
        const rect = $message[0].getBoundingClientRect();
        expect(rect.top).to.be.greaterThan(50);
        expect(rect.top).to.be.lessThan(140);
      });

    cy.get('#message-composer').should(($composer) => {
      const rect = $composer[0].getBoundingClientRect();
      expect(rect.bottom).to.be.lessThan(Cypress.config('viewportHeight'));
    });
  });
});
