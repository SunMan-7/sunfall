/*
This component displays the menu on the left side panel of project dashboard.
*/
import { useEffect, memo, useMemo } from 'react';
import styles from '../styles/components/DashboardMenu.module.css';
import { NavLink, matchPath } from 'react-router-dom';
import {
  Squares2X2Icon, ArrowUpTrayIcon, UsersIcon, MagnifyingGlassIcon, 
  ClipboardDocumentListIcon, MapPinIcon, BookOpenIcon
} from '@heroicons/react/24/outline';

const DashboardMenu = memo(({isOpen, setIsOpen, pathname}) => {
  const isInitialPage = matchPath("/organization/project", pathname);

  // Displays menu icons and menu names or just menu icons
  const handleWindowResize = () => {
    if (window.innerWidth <= 768) { // displays menu icons only
      setIsOpen(false);
    } else { // displays menu icons and menu names
      setIsOpen(true);
    }
    // eslint-disable-line react-hooks/exhaustive-deps
  }

  useEffect(() => {
    // handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    }; 
     
  },[]);// eslint-disable-line react-hooks/exhaustive-deps  

  const urlBase = "/organization/project"
  const asideMenuItems = useMemo( () => [ 
    // {
    //   label: 'Cameras',
    //   href: `${urlBase}/cameras`,
    //   icon: CameraIcon,
    // }, 
    // {
    //   label: 'Locations',
    //   href: `${urlBase}/locations`,
    //   icon: MapPinIcon,
    // },       
    {
      label: 'Details',
      href: `${urlBase}/details`,
      icon: ClipboardDocumentListIcon,
    },
    {
      label: 'Upload',
      href: `${urlBase}/upload`,
      icon: ArrowUpTrayIcon,
    }, 
    {
      label: 'Identify',
      href: `${urlBase}/identify`,
      icon: MagnifyingGlassIcon,
    },
    {
      label: 'Catalogued',
      href: `${urlBase}/catalogued`,
      icon: BookOpenIcon,
    }, 
    // {
    //   label: 'Individuals',
    //   href: `${urlBase}/individuals`,
    //   icon: IdentificationIcon,
    // },   
    // {
    //   label: 'Species',
    //   href: `${urlBase}/species`,
    //   icon: TagIcon,
    // },    
    // {
    //   label: 'Analysis',
    //   href: '/analysis',
    //   icon: DocumentMagnifyingGlassIcon,
    // },     
    {
      label: 'Users',
      href: `${urlBase}/users`,
      icon: UsersIcon,
    },  
    
  ], []);

  return (
    <aside 
      style={{width: isOpen ? '200px' : '70px' }}
      className={styles.sidebar}
    >      
      <div>
        <NavLink to={urlBase}
          key='summary' 
          className={styles['sidebar__link']}
          style={{background: isInitialPage ? '#F2F3CC' : 'transparent'}}
          // style={({ isActive}) => (isActive ? {color: 'red'} : null)}                            
          // onClick={handleWindowResize}
        >                                                          
          <Squares2X2Icon className={styles['sidebar__link-icon']} />
          <span className={styles['sidebar__link-label']}                             
            style={{display: isOpen ? 'block' : 'none'}}
          >Summary</span>
        </NavLink>

        {asideMenuItems.map(({ label, href, onClick, icon: Icon }) => (
          href ? (
          <NavLink to={href}
            key={label} 
            className={styles['sidebar__link']}
            style={({ isActive}) => (isActive ? {background: '#F2F3CC'} : null)}                            
            // onClick={handleWindowResize}
          >                                                          
            <Icon className={styles['sidebar__link-icon']} />
            <span className={styles['sidebar__link-label']}                             
              style={{display: isOpen ? 'block' : 'none'}}
            >{label}</span>
          </NavLink>
          ) : (
          <button key={label} 
            onClick={onClick} 
            className={styles['sidebar__link']}>
            <Icon className={styles['sidebar__link-icon']} />
            <span className={styles['sidebar__link-label']}                             
              style={{display: isOpen ? 'block' : 'none'}}
            >{label}</span>
          </button>
          )
        ))} 
      </div>               
    </aside> 
  )
});

export default DashboardMenu