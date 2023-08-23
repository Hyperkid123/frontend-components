import React from 'react';
import { mount } from '@cypress/react';

import { DownloadButton } from '..';

describe('DownloadButton component', () => {
  beforeEach(() => {
    mount(<DownloadButton />);
  });

  it('renders the dropdown', () => {
    cy.get('.pf-v5-c-dropdown');
  });

  it('on download CSV callback fired', () => {
    // Arrange
    const onSelectSpy = cy.spy().as('onSelectSpy');
    mount(<DownloadButton onSelect={onSelectSpy} />);
    // Act
    cy.get('div[data-ouia-component-id="Export"] > button').click();
    cy.get('div[data-ouia-component-id="Export"] > ul > li > button[data-ouia-component-id="DownloadCSV"]').click();
    // Assert
    cy.get('@onSelectSpy').should('have.been.called.with', 'csv');
  });

  it('on download JSON callback fired', () => {
    // Arrange
    const onSelectSpy = cy.spy().as('onSelectSpy');
    mount(<DownloadButton onSelect={onSelectSpy} />);
    // Act
    cy.get('div[data-ouia-component-id="Export"] > button').click();
    cy.get('div[data-ouia-component-id="Export"] > ul > li > button[data-ouia-component-id="DownloadJSON"]').click();
    // Assert
    cy.get('@onSelectSpy').should('have.been.called.with', 'json');
  });
});
