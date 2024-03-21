import React, { useState, useContext } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { IconContext } from 'react-icons/lib';
import { sideBarData } from './sideBarData';
import { Button, Navbar as BootstrapNavbar, Nav } from 'react-bootstrap';
import AuthContext from '../context/AuthContext'


const Navbar = () => {
  let {user, logoutUser} = useContext(AuthContext)
  const [sidebar, setSideBar] = useState(false);

  const showSideBar = () => setSideBar(!sidebar);

  return (
    <>
      <IconContext.Provider value={{ color: '#fff' }}>
        <BootstrapNavbar bg="dark" variant="dark" expand="md" className="navbar">
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={showSideBar} />
          </Link>
          <Link to="/" className="navbar-brand me-auto">
            {user && <span>Hello {user.firstname}</span>}
          </Link>
          <Nav>
            <Nav.Link href="/createInc" className="nav-link">
              Create Income
            </Nav.Link>
            <Nav.Link href="/createExp" className="nav-link">
              Create Expense
            </Nav.Link>
            <Nav.Link href="/createBudg" className="nav-link">
              Create Budget
            </Nav.Link>
            <Nav.Link href="/createGoal" className="nav-link">
              Create Goal
            </Nav.Link>
          </Nav>
        </BootstrapNavbar>

        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className="nav-menu-items" onClick={showSideBar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            {sideBarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
};

export default Navbar;
