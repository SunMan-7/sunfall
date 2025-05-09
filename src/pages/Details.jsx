import Deployment from '../components/details/deployment/DeploymentTab';
import CustomTab from '../components/CustomTab';
import Subproject from '../components/details/subprojects/Subproject';
import EditProject from '../components/organizationPage/EditProject';
import Location from './Locations';
// import { Outlet } from 'react-router-dom';

const tabs = [
  {
    label: 'Subprojects',
    content: <Subproject />
    // content: <Outlet />
  },
  {
    label: 'Locations',
    content: <Location />
  },
  {
    label: 'Camera Checks',
    content: <Deployment />
  },
  {
    label: 'Edit Project',
    content: <EditProject />
  }
];
const DetailsPage = () => {
  return (
    <>
    <CustomTab tabs={tabs} />  
    </>
  )
}

export default DetailsPage