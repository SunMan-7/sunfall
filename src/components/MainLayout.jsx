/*
This component is protected. It should only be accessed after users are authenticated.
*/
import { useState, useEffect, useContext } from 'react';
import UserContext from './context/UserContext';
import { useSignOut } from '@nhost/react';
// import { gql, useQuery } from '@apollo/client';
import { Outlet, useLocation, } from 'react-router-dom';
// import IdleUserDetector from './IdleUserDetector';
import Header from './Header';
import DashboardMenu from './DashboardMenu';

// const GET_USER_QUERY = gql `
//   query GetUser($id: uuid!) {
//     user(id: $id) {
//       id
//       email
//       displayName
//       metadata
//       avatarUrl
//       defaultRole 
//       default_organization{
//         organization_id
//         is_revoked
//       }   
//     }
//   }
// `

const MainLayout = () => {  
  const user = useContext(UserContext);
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(true);  
  const isProjectPath = pathname.startsWith('/organization/project');
  const { signOut } = useSignOut();
  const toggle = () => setIsOpen(!isOpen);  

  let inactivityTimer;

  // Signs out the user after inactivity
  const handleSignOut = () => {
    localStorage.removeItem('project');
    localStorage.removeItem('organization');
    signOut();
  };

  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(handleSignOut, 1000 * 60 * 15); // 15 minutes of inactivity
  };

  useEffect(() => {
    // Add event listeners for various user actions
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);

    // Set the initial timer
    resetTimer();

    return () => {
      // Clean up event listeners and timer on component unmount
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      clearTimeout(inactivityTimer);
    };
  }, []);
 
  return (
    <div style={{width: '100%'}}>
      <Header 
        toggle={toggle} 
        signOut={signOut}
        user={user} 
        isProjectPath={isProjectPath}
        pathname={pathname}
      /> 
      {isProjectPath && 
        <DashboardMenu isOpen={isOpen} setIsOpen={setIsOpen} pathname={pathname} />
      }   
      <main style={{paddingTop: '5.5em'}}>         
        {
        isProjectPath
        ? (
          <div style={{marginLeft: isOpen ? '205px' : '75px', marginRight: '1rem' }}>
            <Outlet context={{ user}}/>
          </div>
          )
        : (
          <Outlet 
            context={{ user }} 
          />
          )
        }        
      </main> 
      {/* <IdleUserDetector signOut={signOut} seconds={900}/>          */}
    </div>
  );
};

export default MainLayout;
