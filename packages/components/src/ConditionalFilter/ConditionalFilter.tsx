import React, { FormEvent, Fragment, ReactNode, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import globalBreakpointMd from '@patternfly/react-tokens/dist/js/global_breakpoint_md';
import { Icon, Split, SplitItem, ToolbarGroup, ToolbarItem, ToolbarToggleGroup } from '@patternfly/react-core';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core/deprecated';

import { FilterIcon } from '@patternfly/react-icons';
import TextFilter, { FilterValue } from './TextFilter';
import { conditionalFilterType, typeMapper } from './conditionalFilterConstants';
import { RadioFilterProps } from './RadioFilter';
import { CheckboxFilterProps } from './CheckboxFilter';
import { GroupFilterProps } from './GroupFilter';
import './conditional-filter.scss';

export type FilterValues = TextInputProps &
  RadioFilterProps &
  CheckboxFilterProps &
  GroupFilterProps & {
    /** Optional items. */
    items?: FilterValue[];
  };
export interface TextInputProps {
  /** Optional id. */
  id?: string;
  /** Optional onChange callback. */
  onChange?: (e: React.MouseEvent | React.ChangeEvent | React.FormEvent<HTMLInputElement>, selection?: number | string) => void;
  /** Optional text input placeholder. */
  placeholder?: string;
  /** Optional value. */
  value?: string;
}

/**
 * Component that works as a conditional filter with different types of items and groups.
 *
 * It supports type text, checkbox, radio, custom, group (+ tree view).
 */
export interface ConditionalFilterItem {
  id?: string;
  label?: ReactNode;
  value?: string;
  type: 'text' | 'checkbox' | 'radio' | 'custom' | 'group';
  filterValues?: Omit<FilterValues, 'value'> & { value?: string | string[] | FilterValue | FilterValue[] | Record<string, unknown> };
  placeholder?: string;
}

export interface ConditionalFilterProps<R extends HTMLElement = any> extends TextInputProps {
  hideLabel?: boolean;
  items: ConditionalFilterItem[];
  id?: string;
  isDisabled?: boolean;
  useMobileLayout?: boolean;
  innerRef?: React.Ref<R>;
}

const ConditionalFilter: React.FunctionComponent<ConditionalFilterProps> = ({
  hideLabel = false,
  id = 'default-input',
  isDisabled = false,
  items = [],
  onChange,
  placeholder,
  useMobileLayout = false,
  value = '',
  innerRef,
}) => {
  const breakpointConstant = parseInt(globalBreakpointMd.value.replace('px', ''));
  const updateFilterViewport = (width: number) => width <= breakpointConstant;
  const [isOpen, setIsOpen] = useState(false);
  const [stateValue, setStateValue] = useState<number | string>();
  const [isMobile, setIsMobile] = useState(updateFilterViewport(window.innerWidth));
  const resizeListener = useRef((event: Event) => {
    setIsMobile(updateFilterViewport((event?.target as Window).innerWidth));
  });

  useEffect(() => {
    useMobileLayout ||
      console.warn(`The prop "useMobileLayout" is set to false. You are using an outdated mobile layout of conditional filter.
    Please switch to new layout by adding "useMobileLayout={true}" prop to the PrimaryToolbar or ConditionalFilter directly.
    The new mobile layout will become the default in next minor release.`);

    window.addEventListener('resize', resizeListener.current);

    return () => {
      resizeListener.current && window.removeEventListener('resize', resizeListener.current);
    };
  }, []);

  const currentValue = onChange ? value : stateValue;
  const activeItem = items && items.length && (items.find((item, key) => item.value === currentValue || key === Number(currentValue)) || items[0]);
  const onChangeDefault = (_e: FormEvent<HTMLInputElement>, value: number | string) => setStateValue(value);
  const onChangeCallback = onChange || onChangeDefault;
  const shouldRenderNewLayout = useMobileLayout && isMobile;

  const capitalize = (string: string) => string[0].toUpperCase() + string.substring(1);

  const ActiveComponent = activeItem && (typeMapper[activeItem.type] || typeMapper.text);
  const Wrapper =
    useMobileLayout && isMobile
      ? (props: Record<string, unknown>) => <ToolbarToggleGroup {...props} breakpoint="md" toggleIcon={<FilterIcon />}></ToolbarToggleGroup>
      : Fragment;

  return (
    <Wrapper>
      {useMobileLayout && isMobile && (
        <ToolbarGroup className="ins-c-conditional-filter mobile">
          {items.map((activeItem, key) => {
            const ActiveComponent = activeItem && (typeMapper[activeItem.type] || typeMapper.text);
            return (
              <ToolbarItem key={key}>
                <ActiveComponent
                  {...(activeItem.type !== conditionalFilterType.custom && {
                    placeholder: placeholder || activeItem.placeholder || `Filter by ${activeItem.label}`,
                    id: activeItem.filterValues ? activeItem.filterValues.id : currentValue ? String(currentValue) : undefined,
                    innerRef,
                  })}
                  {...activeItem.filterValues}
                />
              </ToolbarItem>
            );
          })}
        </ToolbarGroup>
      )}
      {!shouldRenderNewLayout && (
        <Fragment>
          {!items || (items && items.length <= 0) ? (
            <div
              className={classNames('ins-c-conditional-filter', {
                desktop: useMobileLayout,
              })}
            >
              <TextFilter
                innerRef={innerRef}
                id={id}
                isDisabled={isDisabled}
                onChange={(e) => onChangeCallback(e as FormEvent<HTMLInputElement>, (e.target as HTMLInputElement).value)}
                placeholder={placeholder}
                value={currentValue ? String(currentValue) : undefined}
                widget-type="InsightsInput"
              />
            </div>
          ) : (
            <Split
              className={classNames('ins-c-conditional-filter', {
                desktop: useMobileLayout,
              })}
            >
              {items.length > 1 && (
                <SplitItem>
                  <Dropdown
                    ref={innerRef}
                    className="ins-c-conditional-filter__group"
                    onSelect={() => setIsOpen(false)}
                    isOpen={isOpen}
                    ouiaId="ConditionalFilter"
                    toggle={
                      <DropdownToggle
                        aria-label="Conditional filter"
                        onToggle={(_e, isOpen) => setIsOpen(isOpen)}
                        isDisabled={isDisabled}
                        className={hideLabel ? 'ins-c-conditional-filter__no-label' : ''}
                        ouiaId="ConditionalFilter"
                      >
                        <Icon size="sm">
                          <FilterIcon />
                        </Icon>
                        {!hideLabel && (
                          <span className="ins-c-conditional-filter__value-selector">{activeItem && capitalize(String(activeItem.label))}</span>
                        )}
                      </DropdownToggle>
                    }
                    dropdownItems={items.map((item, key) => (
                      <DropdownItem
                        key={item.id ? `${item.id}-dropdown` : key}
                        component="button"
                        ouiaId={String(item.label)}
                        onClick={(e) => onChangeCallback(e as FormEvent<HTMLInputElement>, item.value || key)}
                      >
                        {capitalize(String(item.label))}
                      </DropdownItem>
                    ))}
                  />
                </SplitItem>
              )}
              {ActiveComponent && (
                <SplitItem isFilled>
                  <ActiveComponent
                    {...(activeItem.type !== conditionalFilterType.custom && {
                      placeholder: placeholder || activeItem.placeholder || `Filter by ${activeItem.label}`,
                      id: (activeItem.filterValues && activeItem.filterValues.id) || currentValue ? String(currentValue) : undefined,
                    })}
                    {...activeItem.filterValues}
                  />
                </SplitItem>
              )}
            </Split>
          )}
        </Fragment>
      )}
    </Wrapper>
  );
};

export default ConditionalFilter;
