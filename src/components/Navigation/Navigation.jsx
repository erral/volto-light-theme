// SemanticUI-free pre-@plone/components

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { NavLink, withRouter } from 'react-router-dom';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import { useIntl, defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import { getNavigation } from '@plone/volto/actions';
import { Icon } from '@plone/volto/components';
import clearSVG from '@plone/volto/icons/clear.svg';
import NavItem from '@plone/volto/components/theme/Navigation/NavItem';

const messages = defineMessages({
  overview: {
    id: 'Overview',
    defaultMessage: 'Overview',
  },
});

const Navigation = ({ getNavigation, pathname, items, lang }) => {
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(null);
  const [currentOpenIndex, setCurrentOpenIndex] = useState(null);
  const navigation = useRef(null);
  const intl = useIntl();
  const enableFatMenu = config.settings.enableFatMenu;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navigation.current && doesNodeContainClick(navigation.current, e))
        return;
      closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside, false);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, false);
    };
  }, []);

  useEffect(() => {
    const { settings } = config;
    if (!hasApiExpander('navigation', getBaseUrl(pathname))) {
      getNavigation(getBaseUrl(pathname), settings.navDepth);
    }
  }, [getNavigation, pathname]);

  const isActive = (url) => {
    return (url === '' && pathname === '/') || (url !== '' && pathname === url);
  };

  const openMenu = (index) => {
    if (index === currentOpenIndex) {
      setDesktopMenuOpen(null);
      setCurrentOpenIndex(null);
    } else {
      setDesktopMenuOpen(index);
      setCurrentOpenIndex(index);
    }
  };

  const closeMenu = (index) => {
    setDesktopMenuOpen(null);
    setCurrentOpenIndex(null);
  };

  return (
    <nav
      id="navigation"
      aria-label="navigation"
      className="navigation"
      ref={navigation}
    >
      <div className={'computer large screen widescreen only'}>
        <ul className="desktop-menu">
          {items.map((item, index) => (
            <li key={item.url}>
              {enableFatMenu ? (
                <>
                  <button
                    onClick={() => openMenu(index)}
                    className={cx('item', {
                      active:
                        desktopMenuOpen === index ||
                        (!desktopMenuOpen && pathname === item.url),
                    })}
                  >
                    {item.title}
                  </button>

                  <div className="submenu-wrapper">
                    <div
                      className={cx('submenu', {
                        active: desktopMenuOpen === index,
                      })}
                    >
                      <div
                        role="presentation"
                        className="close"
                        onClick={closeMenu}
                      >
                        <Icon name={clearSVG} size="48px" />
                      </div>
                      <div className="submenu-inner">
                        <NavLink
                          to={item.url === '' ? '/' : item.url}
                          onClick={() => closeMenu()}
                          className="submenu-header"
                        >
                          <h2>
                            {item.nav_title ?? item.title} (
                            {intl.formatMessage(messages.overview)})
                          </h2>
                        </NavLink>
                        <ul>
                          {item.items &&
                            item.items.length > 0 &&
                            item.items.map((subitem) => (
                              <div
                                className="subitem-wrapper"
                                key={subitem.url}
                              >
                                <li key={subitem.url}>
                                  <NavLink
                                    to={subitem.url}
                                    onClick={() => closeMenu()}
                                    className={cx({
                                      current: isActive(subitem.url),
                                    })}
                                  >
                                    <span className="left-arrow">&#8212;</span>
                                    <span>
                                      {subitem.nav_title || subitem.title}
                                    </span>
                                  </NavLink>
                                </li>
                                <div className="sub-submenu">
                                  <ul>
                                    {subitem.items &&
                                      subitem.items.length > 0 &&
                                      subitem.items.map((subsubitem) => (
                                        <div
                                          className="subsubitem-wrapper"
                                          key={subsubitem.url}
                                        >
                                          <li key={subsubitem.url}>
                                            <NavLink
                                              to={subsubitem.url}
                                              onClick={() => closeMenu()}
                                              className={cx({
                                                current: isActive(
                                                  subsubitem.url,
                                                ),
                                              })}
                                            >
                                              <span className="left-arrow">
                                                &#8212;
                                              </span>

                                              <span>
                                                {subsubitem.nav_title ||
                                                  subsubitem.title}
                                              </span>
                                            </NavLink>
                                          </li>
                                        </div>
                                      ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <NavItem item={item} lang={lang} key={item.url} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  getNavigation: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  lang: PropTypes.string.isRequired,
};

Navigation.defaultProps = {
  token: null,
};

export default compose(
  injectIntl,
  withRouter,
  connect(
    (state) => ({
      token: state.userSession.token,
      items: state.navigation.items,
      lang: state.intl.locale,
    }),
    { getNavigation },
  ),
)(Navigation);
