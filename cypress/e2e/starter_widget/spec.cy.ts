describe('Starter Widget', () => {
  it('should render the tabbed starter widget', () => {
    cy.wait(1000);
    cy.get('#starters').should('exist');
    cy.contains('News Assistant').should('be.visible');
    cy.contains('button', 'Trending').should('exist');
    cy.contains('button', 'While you were away').should('exist');
    cy.get('#starter-top-stories').should('exist');
    cy.get('#starter-market-brief').should('not.exist');
  });

  it('should switch tabs and send a starter message', () => {
    cy.wait(1000);
    cy.contains('button', 'While you were away').click();
    cy.get('#starter-market-brief').should('exist').click();
    cy.get('.step').should('have.length', 2);
    cy.get('.step').eq(0).contains('Give me the latest market brief');
    cy.get('.step').eq(1).contains('Give me the latest market brief');
  });
});
