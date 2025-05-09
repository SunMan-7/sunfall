import { useState, useMemo, useEffect } from 'react';
import { Button, Modal, Row, Col } from 'react-bootstrap';
import NewLocation from '../components/locations/NewLocation';
import TableWrapper from '../components/TableWrapper';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Spinner from '../components/Spinner';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECT_LOCATIONS, INSERT_LOCATIONS_MANY } from '../api/locationGql';
import Map from '../components/Map';
import EditLocation from '../components/locations/EditLocation';
import { convertUtmToLatLng } from '../helpers';
import ExportToCSV from '../components/csvOptions/ExportToCSV';
import ImportToCSV from '../components/csvOptions/ImportCSV';
import { toast } from 'react-hot-toast';

const csvTemplateData = [{
  project_code: null,
  location_name: null,
  x: null, y: null, remarks: null
}];

const LocationPage = () => {
  const { id: projectId, project_code } = JSON.parse(localStorage.getItem('project'));
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [rowData, setRowData] = useState();
  const [latLng, setLatLng] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [importData, setImportData] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [polygon, setPolygon] = useState([]);

  const { loading, error, data } = useQuery(GET_PROJECT_LOCATIONS, {
    variables: { projectId },
    skip: !projectId
  });
  const [insertLocationsMany] = useMutation(INSERT_LOCATIONS_MANY, {
    refetchQueries: [GET_PROJECT_LOCATIONS]
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseEdit = () => setShowEdit(false);

  const handleEditBtn = (prop) => {
    setRowData(prop);
    setShowEdit(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: () => "ID",
      },
      {
        accessorKey: "location_name",
        header: () => "Name",
      },
      {
        accessorKey: "y",
        header: () => "Y",
      },
      {
        accessorKey: "x",
        header: () => "X",
      },
      {
        header: "Actions",
        cell: (prop) => {
          return (
            <div style={{
              display: 'flex', gap: '7%', color: 'green',
              justifyContent: 'center'
            }}>
              <button>
                <PencilSquareIcon
                  style={{ width: '24px', height: '24px' }}
                  onClick={() => handleEditBtn(prop.row.original)}
                />
              </button>
            </div>)
        },
      },
    ],
    []
  );

  const handleSubmit = async () => {
    setProcessing(true);
    const values = [];
    try {
      for (const item of importData) {
        if (item.project_code !== project_code) {
          setImportData([]);
          setProcessing(false);
          return toast.error("File contains invalid project code!");
        }
        values.push({
          location_name: item.location_name.trim(),
          x: item.x, y: item.y, remarks: item.remarks,
          project_id: projectId
        });
      }
      await insertLocationsMany({
        variables: { values }
      });
      toast.success("Successfully inserted locations");
    } catch (error) {
      console.error(error.message);
      toast.error('Unable to add datasets');
    }
    setImportData([]);
    setProcessing(false);
  };

  useEffect(() => {
    if (data?.locations) {
      const tempCsvData = [];
      const tempLatLng = [];

      for (const l of data?.locations) {
        const latLng = convertUtmToLatLng(l.x, l.y, 16, 'Q', l.location_name);
        tempCsvData.push({
          location_id: l.id,
          location_name: l.location_name,
          x: l.x, y: l.y, remarks: l.remarks
        });
        tempLatLng.push(latLng);
      }

      // Calculate bounding box for polygon
      const lats = tempLatLng.map(coord => coord.lat);
      const lngs = tempLatLng.map(coord => coord.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      // Define polygon coordinates
      const polygonCoords = [
        [minLat, minLng],
        [minLat, maxLng],
        [maxLat, maxLng],
        [maxLat, minLng],
        [minLat, minLng]
      ];

      setCsvData(tempCsvData);
      setLatLng(tempLatLng);
      setPolygon(polygonCoords);
    }
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    console.log(error);
    return <div>Something went wrong! Try refreshing the page</div>;
  }

  return (
    <div className='px-3'>
      <Row>
        <Col md={6} sm={12} style={{ height: '60dvh' }}>
          {latLng && <Map markers={latLng} polygon={polygon} />}
        </Col>
        <Col md={6} sm={12}>
          <div className='mb-3' style={{ display: 'flex', gap: '1rem' }}>
            {data?.locations.length === 0 &&
              <Button variant="primary" onClick={handleShow} size='sm'> Add New Location </Button>
            }
            {data?.locations.length > 0 &&
              <ExportToCSV csvData={csvData} fileName='locations' />
            }
            <ExportToCSV csvData={csvTemplateData} fileName={'locations_template'} label='Download CSV Template' />
            <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
              <ImportToCSV setImportData={setImportData} />
              {importData.length > 0 &&
                <Button onClick={handleSubmit} variant='link' size='sm' disabled={processing}>
                  {processing ? <Spinner size='sm' /> : "Submit imported data"}
                </Button>
              }
            </div>
          </div>
          {data?.locations.length > 0 &&
            <TableWrapper
              data={data?.locations}
              columns={columns}
              page={handleShow}
              insertBtnType="modal"
            />
          }
        </Col>
      </Row>

      <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Location</Modal.Title>
        </Modal.Header>
        <Modal.Body> {show && <NewLocation handleClose={handleClose} />} </Modal.Body>
      </Modal>

      <Modal show={showEdit} onHide={handleCloseEdit} backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showEdit &&
            <EditLocation
              data={rowData}
              handleCloseEdit={handleCloseEdit}
            />}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LocationPage;
