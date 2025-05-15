// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NhostClient, NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/ProtectedRoute';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';

import SpeciesTable from './pages/public/SpeciesTable';
import Settings from './pages/Settings';
import Cameras from './pages/Cameras';
import Species from './pages/Species';
import Individuals from './pages/Individuals';
import DownloadData from './pages/DownloadData';

import HomePage from './pages/Home';
import Organization from './pages/Organization';
import MainLayout from './components/MainLayout';
import NewProject from './components/organizationPage/NewProject';
// import Location from './pages/Locations';

import Dashboard from './pages/Dashboard';
import Details from './pages/Details';
import Identify from './pages/Identify';
import Catalogued from './pages/Catalogued';
import Upload from './pages/Upload';
// import Analysis from './pages/Analysis';
import Users from './pages/Users';

const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION
})

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <BrowserRouter>
          <Routes>
            <Route path="sign-up" element={<SignUp />} />
            <Route path="sign-in" element={<SignIn />} /> 
            <Route path='change-password' element={<ChangePassword />} />
            <Route path='reset-password' element={<ResetPassword />} />  
            <Route path="search-species" element={<SpeciesTable />} />                      
            <Route path="/" element={<ProtectedRoute><MainLayout nhost={nhost}  /></ProtectedRoute>}>              
              <Route index element={<HomePage />} />
              <Route path="species" element={<Species />} />
              <Route path="individuals" element={<Individuals nhost={nhost}/>} />
              <Route path="download-data" element={<DownloadData nhost={nhost} />} />
              <Route path="settings" element={<Settings />} />
              <Route path="new-project" element={<NewProject />} />
              <Route path="organization" >   
                <Route index element={<Organization />} />
                <Route path="cameras" element={<Cameras />} />                              
                <Route path="project" >
                  <Route index element={  <Dashboard /> } />
                  <Route path="details" element={<Details/>} /> 
                  <Route path="upload" element={<Upload nhost={nhost} />} />                
                  <Route path="identify" element={<Identify nhost={nhost} />} />
                  <Route path="catalogued" element={<Catalogued nhost={nhost}/>} />                  
                  {/* <Route path="analysis" element={<Analysis />} />   */}
                  <Route path="users" element={<Users />} />
                </Route> 
              </Route>
            </Route>            
          </Routes>        
        </BrowserRouter>

        <Toaster />
    </NhostApolloProvider>
    </NhostProvider>
  )
}

export default App
