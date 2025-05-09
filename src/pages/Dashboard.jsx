/*
This component is labeled as Summary on the dashboard menu. It displays some 
project metadata such as number of images within the project.
*/
import styles from '../styles/pages/Dashboard.module.css';
import { useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { GET_TOTAL_SPECIES_IDENTIFIED, GET_TOTAL_IMAGES, GET_TOTAL_CHECKS, 
  GET_TOTAL_WILDLIFE_IMAGES, GET_TOTAL_PROJ_LOCATIONS, GET_TOTAL_PROJ_CAMERAS,
  GET_PROJECT_SAMPLING_DAYS, IMAGE_COUNT_PER_SPECIES,
  } from '../api/dashboardGql';
import { useQuery } from '@apollo/client';
import {Card, Popover, Row, Col} from 'react-bootstrap';
import CustomCard from '../components/dashboard/CustomCard';
import Spinner from '../components/Spinner';
import { BarChart, Bar, XAxis, YAxis, LabelList, 
  Tooltip, ResponsiveContainer } from 'recharts';

const speciesPopover = (
  <Popover id="popover-basic">
    <Popover.Body>
      The number of unique wild and domesticated species in the project. 
      The count does not include humans, or non-animal objects.
    </Popover.Body>
  </Popover>
);

const totalImagesPopover = (
  <Popover id="popover-basic">
    <Popover.Body>
      The number of images containing animals and other identified objects 
      as well as images with no object, or blank images.
    </Popover.Body>
  </Popover>
)

const wildlifeImagesPopover = (
  <Popover id="popover-basic">
    <Popover.Body>
      The number of images containing animals.
    </Popover.Body>
  </Popover>
)

const locationsPopover = (
  <Popover id="popover-basic">
    <Popover.Body>
      The number of unique locations in the project.
    </Popover.Body>
  </Popover>
)

const cameraChecksPopover = (
  <Popover id="popover-basic">
    <Popover.Body>
      The number of times a camera was checked for data retrieval and insertion
      of new storage at a specific location.
    </Popover.Body>
  </Popover>
)

const camerasPopover = (
  <Popover id="popover-basic">
    <Popover.Body>
      The number of physical cameras deployed in the project.
    </Popover.Body>
  </Popover>
)

const samplingDaysPopover = (
  <Popover id="popover-basic">
    <Popover.Body>
      The number of days when a camera was active.
    </Popover.Body>
  </Popover>
)

const Dashboard = () => {
  const { user } = useOutletContext(); 
  const projectId = JSON.parse(localStorage.getItem('project')).id;
  
  const {data: identifiedSpeciesCount, loading: loadingSpeciesCount} = useQuery(GET_TOTAL_SPECIES_IDENTIFIED, {
    variables: {projectId},
    skip: !projectId
  }); 

  const {data: imagesCount, loading: loadingImagesCount} = useQuery(GET_TOTAL_IMAGES, {
    variables: {projectId},
    skip: !projectId
  }); 

  const {data: wildlifeImagesCount, loading: loadingWildlifeImagesCount} = useQuery(GET_TOTAL_WILDLIFE_IMAGES, {
    variables: {projectId},
    skip: !projectId
  }); 

  const {data: locationsCount, loading: loadingLocationsCount} = useQuery(GET_TOTAL_PROJ_LOCATIONS, {
    variables: {projectId},
    skip: !projectId
  }); 

  const {data: checksCount, loading: loadingChecksCount} = useQuery(GET_TOTAL_CHECKS, {
    variables: {projectId},
    skip: !projectId
  }); 

  const {data: camerasCount, loading: loadingCamerasCount} = useQuery(GET_TOTAL_PROJ_CAMERAS, {
    variables: {projectId},
    skip: !projectId
  }); 

  const {data: samplingDaysCount, loading: loadingSamplingDaysCount} = useQuery(GET_PROJECT_SAMPLING_DAYS, {
    variables: {projectId},
    skip: !projectId
  }); 

  const {data: imageCountPerSpecies, loading: loadingImageCountPerSpecies} = useQuery(IMAGE_COUNT_PER_SPECIES, {
    variables: {projectId},
    skip: !projectId
  }); 
  
     
  return (
    <>
      <Helmet>
        <title>Summary </title>
      </Helmet>

      <div>
        <h2 className={styles.title}>Summary</h2>

        <p className={styles['welcome-text']}>
          Welcome {user?.default_organization?.organization_id}, {user?.metadata?.firstName || 'Wildlife Heroe'}{' '}
          <span role="img" alt="hello">
            👋 
          </span>
        </p>

        <p className={styles['info-text']}>
        
        </p>
      </div>

      <div className='mb-3'></div>
      {/* {data?.locations.length !== 0 &&
        <div style={{width: '100%', height: '70dvh'}} className='mb-5'>
          <Map markers={data?.locations}/>
        </div> 
      }   */}

            
      {/* <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'}}>  */}
      <Row>
        <Col lg={6} md={12}>
          <div className="d-flex  flex-wrap gap-3" style={{width: '100%'}}>
            <CustomCard 
              subtitle='Species'
              loading={loadingSpeciesCount}
              count={identifiedSpeciesCount?.image_species_aggregate?.aggregate?.count}
              popover={speciesPopover}
            />

            <CustomCard 
              subtitle='Total images'
              loading={loadingImagesCount}
              count={imagesCount?.images_aggregate?.aggregate?.count}
              popover={totalImagesPopover}
            />

            <CustomCard 
              subtitle='Wildlife images'
              loading={loadingWildlifeImagesCount}
              count={wildlifeImagesCount?.image_species_aggregate?.aggregate?.count}
              popover={wildlifeImagesPopover}
            />

            <CustomCard 
              subtitle='Locations'
              loading={loadingLocationsCount}
              count={locationsCount?.locations_aggregate.aggregate?.count}
              popover={locationsPopover}
            />

            <CustomCard 
              subtitle='Camera checks'
              loading={loadingChecksCount}
              count={checksCount?.deployments_aggregate.aggregate?.count}
              popover={cameraChecksPopover}
            />

            <CustomCard 
              subtitle='Cameras'
              loading={loadingCamerasCount}
              count={camerasCount?.cameras_aggregate.aggregate?.count}
              popover={camerasPopover}
            />

            <CustomCard 
              subtitle='Trapping Nights'
              loading={loadingSamplingDaysCount}
              count={samplingDaysCount?.sampling_days_view_aggregate.aggregate?.sum?.distinct_date_count ?? 0}
              popover={samplingDaysPopover}
            />
          </div>
        </Col>

        {imageCountPerSpecies?.image_count_per_species?.length > 0 &&
        <Col lg={6} md={12}>
          <Card className="shadow"  >
            <h4 style={{textAlign: 'center'}}>Identified Species</h4>
            <p className='text-muted text-center' >Count of images per species</p>
            {loadingImageCountPerSpecies && <Spinner size='sm' />}
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                // width={500}
                // height={300}                
                data={imageCountPerSpecies?.image_count_per_species}
                layout='vertical'
                margin={{top: 5, right: 30, left: 55, bottom: 10,}}
              >
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis name='images' type='number' hide='true'/>
                <YAxis dataKey="common_name" type='category'/>
                <Tooltip />
                {/* <Legend /> */}
                <Bar name="images" dataKey="image_count" fill="#82ca9d" >
                  <LabelList dataKey="image_count" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card> 
        </Col>
        }
      </Row>  

    </>
  );
};

export default Dashboard;
