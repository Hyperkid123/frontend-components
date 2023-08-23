/* global cy */
/*
Utilities related to URL parameters passed for table filtering
*/

import _ from 'lodash';

import { CHIP, CHIP_GROUP, FILTERS_DROPDOWN, FILTER_TOGGLE } from './selectors';
import { findElementByOuiaId } from './CustomCommands';
findElementByOuiaId();

/**
 * A filter configuration
 * @typedef {Object} FiltersConf
 * @property {string} selectorText - Text of the selector in the filter's dropdown
 * @property {Array} values - List of values to try
 * @property {string} type - Type of selector: input, checkbox, radio
 * @property {Function} filterFunc(it, value) {
    @property {Object} it - Data from the API
    @property {Object} value - Instance from the values above 
 }} - function describing if a given item should stay or be filtered
 */

/**
 * Apply a given set of filters taken into account the filters configuration
 * @typedef {Function} applyFilters
 * @param {*} filters value to set on the filters {key: string (for input/radio) | array (for checkbox)}
 * @param {filtersConf} config global configuration of the filter settings
 */
function applyFilters(filters, filtersConf) {
  for (const [key, value] of Object.entries(filters)) {
    const item = filtersConf[key];
    // open filter selector
    cy.get('div.ins-c-primary-toolbar__filter').find('button[class=pf-v5-c-dropdown__toggle]').click();

    // select appropriate filter
    cy.get(FILTERS_DROPDOWN).contains(item.selectorText).click();

    // fill appropriate filter
    if (item.type === 'input') {
      cy.get('input.ins-c-conditional-filter').type(value);
    } else if (item.type === 'checkbox') {
      cy.get(FILTER_TOGGLE).click();
      value.forEach((it) => {
        cy.get('ul[class=pf-v5-c-select__menu]').find('label').contains(it).parent().find('input[type=checkbox]').check();
      });
      // close dropdown again
      cy.get(FILTER_TOGGLE).click();
    } else if (item.type == 'radio') {
      cy.get(FILTER_TOGGLE).click();
      cy.get('ul[class=pf-v5-c-select__menu]').find('label').contains(value).parent().find('input[type=radio]').check();
    } else {
      throw `${item.type} not recognized`;
    }
  }
}
/**
 * - Converts URL parameters to the values and checks if filter chips with such values exists.
 * @typedef {Function} urlParamConvert
 * @param {string} key - string key of URL parameter
 * @param {string} value - string value of URL parameter
 * @param {Object} filters - Object that contains filters description.
 * @example
 * // of filters parameter
 * FILTER_CATEGORIES = {
 * total_risk: {
 *  type: 'checkbox',
 *  title: 'total risk',
 *  urlParam: 'total_risk',
 *  values: [
 *    { label: TOTAL_RISK_LABEL[4], value: '4' },
 *    { label: TOTAL_RISK_LABEL[3], value: '3' },
 *    { label: TOTAL_RISK_LABEL[2], value: '2' },
 *    { label: TOTAL_RISK_LABEL[1], value: '1' },
 *  ],
 *},
 *}
 */
function urlParamConvert(key, value, filters) {
  const filterCategory = _.find(_.values(filters), (it) => it.urlParam === key);
  let title;
  let label;
  if (filterCategory === undefined) {
    title = _.capitalize(key);
    label = value;
  } else {
    title = _.capitalize(filterCategory.title);
    label = _.find(filterCategory.values, (it) => it.value === value).label.props.children;
  }
  return [title, label];
}
/**
 * - Checks if the filter chip group contain the chip with the passed name and value
 * @typedef {Function} hasChip
 * @param {string} name
 * @param {string} value
 */
function hasChip(name, value) {
  cy.contains(CHIP_GROUP, name).parent().contains(CHIP, value);
}
/**
 * filter data given a set of filter values and their configuration
 * @typedef {Function} filter
 * @param {filtersConf} conf - Configuration of the filters
 * @param {Array} data - Values to be filtered
 * @param {Object} filters - Applied filters and their values
 * @returns {Array} filteredData
 */
function filter(conf, data, filters) {
  let filteredData = data;
  for (const [key, value] of Object.entries(filters)) {
    filteredData = _.filter(filteredData, (it) => conf[key].filterFunc(it, value));
    // if length is already 0, exit
    if (filteredData.length === 0) {
      break;
    }
  }
  return filteredData;
}
/**
 * - Removes all active chips
 * @typedef {Function} removeAllChips
 */
function removeAllChips() {
  // FIXME does not work: OCPADVISOR-22
  // cy.get(CHIP_GROUP)
  //   .find(CHIP)
  //   .ouiaId('close', 'button')
  //   .each(($el) => cy.wrap($el).click());
  cy.get(CHIP_GROUP)
    .find(CHIP)
    .ouiaId('close', 'button')
    .each(() => {
      cy.get(CHIP_GROUP).find(CHIP).ouiaId('close', 'button').eq(0).click();
    });
}

export { applyFilters, urlParamConvert, hasChip, filter, removeAllChips };
