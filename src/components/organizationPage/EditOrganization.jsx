/*
This component is a form that allows organization level admin users to edit some details.
Code_name and ID cannot be changed in this form.
*/

import { useState } from 'react';
import {Modal, Form, Row, Col, Button} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { label } from '../../helpers';
import { useMutation } from '@apollo/client';
import { UPDATE_ORGANIZATION_BYID } from '../../api/organizationGql';
import { GET_ORGANIZATIONS_PROJECTS } from '../../api/organizationGql';

const EditOrganization = ({show, handleClose}) => {
  const selectedOrg = JSON.parse(localStorage.getItem('organization'));
  const [organizationName, setOrganizationName] = useState(selectedOrg?.organization_name ?? '');
  const [shortName, setShortName] = useState(selectedOrg?.short_name ?? '');
  const [address1, setAddress1] = useState(selectedOrg?.address1 ?? '');
  const [address2, setAddress2] = useState(selectedOrg?.address2 ?? '');
  const [district, setDistrict] = useState(selectedOrg?.district ?? '');  

  const isOrgNameDirty = organizationName !== selectedOrg?.organization_name;
  const isShortNameDirty = shortName !== selectedOrg?.short_name;
  const isAddress1Dirty = address1 !== selectedOrg?.address1;
  const isAddress2Dirty = address2 !== selectedOrg?.address2;
  const isDistrictDirty = district !== selectedOrg?.district;
  
  const isFormDirty = (isOrgNameDirty || isAddress1Dirty || isAddress2Dirty || isDistrictDirty || isShortNameDirty);

  const [updateOrganization] = useMutation(UPDATE_ORGANIZATION_BYID, {
    refetchQueries: [GET_ORGANIZATIONS_PROJECTS]
  });
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    const organization = {
      organization_name: organizationName,
      short_name: shortName, address1,
      address2, district
    }

    try{
      await updateOrganization({
        variables: {
          organizationId: selectedOrg?.id,
          organization
        }
      })
      toast.success("Successfully updated organization");

      // Manually add id since this field cannot be changed.
      organization['id'] = selectedOrg?.id;
      
      // Manually add this field since only admin can change this field with great caution.
      // Organization code_name should not be changed because it is used as a storage bucket name
      organization['code_name'] = selectedOrg?.code_name; 

      // Store the updated organization details in local storage for global access.
      localStorage.setItem('organization', JSON.stringify(organization));
    }catch(error){
      console.error(error);
      toast.error('Unable to update!');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit organization details</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Form.Group as={Col} className="mb-3" xs={9}>
              <Form.Label style={label}>
                Organization name<span style={{color: 'red'}}>*</span>
              </Form.Label>
              <Form.Control 
                type="text"
                value={organizationName} 
                onChange={e => setOrganizationName(e.target.value)}
                required 
              />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" xs={3}>
              <Form.Label style={label}>ID<span style={{color: 'red'}}>*</span></Form.Label>
              <Form.Control type="text" value={selectedOrg?.id} disabled readOnly />
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Col} className="mb-3" xs>
              <Form.Label style={label}>
                Short name<span style={{color: 'red'}}>*</span>
              </Form.Label>
              <Form.Control 
                type="text"
                value={shortName}
                onChange={e => setShortName(e.target.value)}
                required 
              />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" xs>
              <Form.Label style={label}>
                Code name<span style={{color: 'red'}}>*</span>
              </Form.Label>
              <Form.Control 
                type="text"
                value={selectedOrg?.code_name}
                disabled
                readOnly
              />
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
              <Form.Label style={label}>
                Address 1
              </Form.Label>
              <Form.Control 
                type="text"
                value={address1}
                onChange={e => setAddress1(e.target.value)}
              />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
              <Form.Label style={label}>
                Address 2
              </Form.Label>
              <Form.Control 
                type="text"
                value={address2}
                onChange={e => setAddress2(e.target.value)}
              />
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" >
            <Form.Label style={label}>
              District
            </Form.Label>
            <Form.Control 
              type="text"
              value={district}
              onChange={e => setDistrict(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type='submit' disabled={!isFormDirty}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default EditOrganization