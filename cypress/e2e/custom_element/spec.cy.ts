describe('Custom Element', () => {
  function getInlineCustomElement() {
    return cy.get('.step').eq(0).find('.inline-custom').first();
  }

  function getTailCustomElement() {
    return cy.get('.step').eq(0).find('.tail-custom').first();
  }

  it('should be able to render an interactive custom element', () => {
    cy.get('.step').should('have.length', 1);

    cy.get('.step').eq(0).find('.inline-custom').should('have.length', 1);
    cy.get('.step').eq(0).find('.tail-custom').should('have.length', 1);
    cy.get('.step').eq(0).find('.element-link').should('not.exist');

    getInlineCustomElement()
      .should('contain', 'Inline')
      .and('contain', 'Count: 1');
    getTailCustomElement()
      .should('contain', 'Tail')
      .and('contain', 'Count: 10');

    cy.get('.step')
      .eq(0)
      .then(($step) => {
        const actionTop = $step.find('button:contains("message action")')[0];
        const tailTop = $step.find('.tail-custom')[0];

        expect(actionTop.compareDocumentPosition(tailTop)).to.equal(
          Node.DOCUMENT_POSITION_FOLLOWING
        );
      });

    getInlineCustomElement().find('#increment').click();
    getInlineCustomElement().should('contain', 'Count: 2');

    getInlineCustomElement().find('#increment').click();
    getInlineCustomElement().should('contain', 'Count: 3');

    getTailCustomElement().find('#increment').click();
    getTailCustomElement().should('contain', 'Count: 11');

    getInlineCustomElement().find('#action').click();

    cy.get('.step').should('have.length', 2);
    cy.get('.step').eq(1).should('contain', 'Executed test action!');

    getTailCustomElement().find('#remove').click();
    cy.get('.step').eq(0).find('.tail-custom').should('not.exist');

    getInlineCustomElement().find('#remove').click();
    cy.get('.step').eq(0).find('.inline-custom').should('not.exist');
  });
});
