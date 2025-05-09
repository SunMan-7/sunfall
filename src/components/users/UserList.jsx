/*
This component displays a list of users where roles can be changed. Users can 
also be revoked.
*/
import { Form } from 'react-bootstrap';
import Avatar from '../Avatar';

const UserList = ({ userData, onRoleChange, onRevokeChange, isDisabled }) => (
  <Form>
    {userData.map((u, index) => (
      <div key={u?.id ?? index} className='mb-3'
        style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}
      >
        {/* User Details */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Avatar src={u.user?.avatarUrl} alt={u.user?.displayName} /> 
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '14px' }}>{u.user?.displayName}</strong>
            <div className="text-muted" style={{ fontSize: '14px', fontStyle: 'italic' }}>
              {u.user?.email}
            </div>
          </div>
        </div>

        {/* Role Selector and Revoke Checkbox */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Form.Group style={{ display: 'flex', alignItems: 'center' }}>               
            <Form.Select 
              value={u.role} // Assuming role is a property of u
              onChange={(e) => onRoleChange(u.id, e.target.value)}
              disabled={isDisabled(u) || u.isRevoked}
            >
              {/* Role options passed as children */}
              {u.roles}
            </Form.Select>
          </Form.Group>

          {/* Revoke Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Form.Check 
              type='checkbox'
              checked={u.isRevoked}
              label='Revoked'
              disabled={isDisabled(u)}
              onChange={(e) => onRevokeChange(u.id, e.target.checked)}
            />
          </div>
        </div>
      </div>
    ))}
  </Form>
);

export default UserList;
