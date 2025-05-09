/*
This component helps to protect other components within the application from being accessed by 
users who are not authenticated or members of an organization.
*/
import styles from '../styles/components/ProtectedRoute.module.css'
import { useAuthenticationStatus, useUserId } from '@nhost/react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import Spinner from './Spinner'
import WelcomePublicPage from '../pages/WelcomePublic';
import { gql, useQuery } from '@apollo/client';
import UserContext from './context/UserContext';

const GET_USER_QUERY = gql `
  query GetUser($id: uuid!) {
    user(id: $id) {
      id
      email
      displayName
      metadata
      avatarUrl
      defaultRole
      user_organizations {
        organization_id
        role
        is_revoked
      }
    }
  }
`

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const id = useUserId();
  const location = useLocation();  
  const {loading, error, data } = useQuery(GET_USER_QUERY, {
    variables: { id },
    skip: !id
  })  

  if (isLoading || loading) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    )
  }

  // redirect users to the sign in page
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  if(error) {
    console.log(error.message);
    return <div>Something went wrong. Please try again</div>    
  }

  const user = data?.user;

  // Display the public welcome page if the user is not an admin and has no associated organizations
  if (user?.defaultRole !== "admin" && user?.user_organizations?.length === 0) {  
    return <WelcomePublicPage />;    
  }
    
  return (
    <UserContext.Provider value={user}>
      {children ? children : <Outlet />}
    </UserContext.Provider >
  );
  
}

export default ProtectedRoute