/*
This component displays the header of the application
*/
import { memo } from 'react';
import styles from '../styles/components/Header.module.css';
import { Fragment } from 'react';
import { Link, useNavigate, matchPath, } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon, Bars3Icon, 
} from '@heroicons/react/24/outline';
import Avatar from './Avatar';

const Header = memo(({toggle, user, isProjectPath, signOut, pathname}) => {
  const selectedOrganization = JSON.parse(localStorage.getItem('organization'));
  const selectedProject = JSON.parse(localStorage.getItem('project'));
  const navigate = useNavigate();  
  const isOrganizationPath = matchPath("/organization", pathname);
  const isCameraPath = matchPath("/organization/cameras", pathname);
  const isLocationPath = matchPath("/organization/locations", pathname);

   // const imgURL = process.env.PUBLIC_URL + 'jaguar-logo-no-bg.png';
  const imgURL = '/jaguar-logo-no-bg.png';
  const userRole = user?.defaultRole;

  // remove data stored in local storage before signing out
  const handleSignOut = () => {
    localStorage.removeItem('project');
    localStorage.removeItem('organization');
    signOut();
  }
  
  const menuItems = [    
    {
      label: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
    },
    {
      label: 'Logout',
      onClick: handleSignOut,
      icon: ArrowLeftOnRectangleIcon,
    },
  ];    

  function capitalizeFirstAndThird(word) {
    if (word?.includes('_')) {
        return word[0].toUpperCase() + '_' + word[2].toUpperCase() + word.slice(3);
    } else {
        // Handle words with less than 3 characters, if needed
        return word[0]?.toUpperCase() + word.slice(1);
    }
}

  return (
    <header className={styles.header}>
      <div className={styles['header-container']}>
        <Menu as='div' className={styles['burger-logo']}>
          {isProjectPath &&
          <Menu.Button onClick={toggle}
            className={styles['burger-wrapper']}>
            <Bars3Icon style={{width: '24px', height: "24px"}}/>
          </Menu.Button>
          }
          <Menu.Button className={styles['logo-wrapper']}>
            <Link to="/" >
              <img src={imgURL} alt="logo" height='54px' /> 
            </Link>
            {
            isOrganizationPath ?
            <span >{selectedOrganization?.organization_name}</span>
            :
            isCameraPath ?
            <span >           
              <span onClick={() => navigate('/organization')}>
                {selectedOrganization?.organization_name}
              </span> / {" "}
              <span >cameras</span>
            </span>  
            : 
            isLocationPath ?
            <span >           
              <span onClick={() => navigate('/organization')}>
                {selectedOrganization?.organization_name}
              </span> / {" "}
              <span >locations</span>
            </span>
            :
            isProjectPath ? 
            <span >           
              <span onClick={() => navigate('/organization')}>
                {selectedOrganization?.organization_name}
              </span> / {" "}
              <span >{selectedProject?.short_name}</span>
            </span>  
            :
            null
            } 
          </Menu.Button>              
        </Menu> 
                      
        {/* <img src={process.env.PUBLIC_URL + 'logo.svg'} alt="logo" /> */}

        <Menu as="div" className={styles.menu}>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            {window.innerWidth > 768 &&
              (userRole && <h6>{capitalizeFirstAndThird(userRole)}</h6>)
            }
          <Menu.Button className={styles['menu-button']}>        
            <Avatar src={user?.avatarUrl} alt={user?.displayName} />  
            {/* <span style={{paddingLeft: '1rem'}}>{user?.displayName} </span>  */}
            <ChevronDownIcon />
          </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter={styles['menu-transition-enter']}
            enterFrom={styles['menu-transition-enter-from']}
            enterTo={styles['menu-transition-enter-to']}
            leave={styles['menu-transition-leave']}
            leaveFrom={styles['menu-transition-leave-from']}
            leaveTo={styles['menu-transition-leave-to']}
          >
            <Menu.Items className={styles['menu-items-container']}>
              <div className={styles['menu-header']}>
                <Avatar src={user?.avatarUrl} alt={user?.displayName} />
                <div className={styles['user-details']}>
                  <span >{user?.displayName}</span>
                  <span className={styles['user-email']}>{user?.email}</span>
                </div>
              </div>

              <div className={styles['menu-items']}>
                {menuItems.map(({ label, href, onClick, icon: Icon }) => (
                  <div key={label} className={styles['menu-item']}>
                    <Menu.Item >
                      {href ? (
                        <Link to={href} >
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      ) : (
                        <button onClick={onClick}>
                          <Icon />
                          <span>{label}</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header> 
  )
});

export default Header