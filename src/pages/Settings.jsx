/*
This component displays the option to change name and password
*/
import Profile from '../components/settings/Profile';
import ChangePassword from '../components/settings/ChangePassword';
import { Helmet } from 'react-helmet';

const Settings = () => {
  return (
    <div style={{maxWidth: '1040px', margin: '0 auto'}}>
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <Profile />
      <div className='mb-5'></div>
      <ChangePassword />
    </div>
  )
}

export default Settings