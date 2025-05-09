import { useIdleTimer } from 'react-idle-timer'
import Button from 'react-bootstrap/Button';
import { useState, useEffect } from 'react';

const modalStyle =  {
  maxWidth: '20em',
  background: 'lightgray',
  borderRadius: '1em',
  padding: '1em',
  position: 'absolute',
  flexDirection: 'column',
  alignItems: 'center',
  left: 'calc(50vw - 10em)',
  top: 'calc(50vh - 10em)',
}

const IdleUserDetector = ({signOut, seconds=60}) => {

  //timeout is in seconds, so it is converted to milliseconds
  const timeout = seconds * 1000;
  const promptBeforeIdle = 15_000; // 15 seconds
  
  // initial time before user is signed out
  const [remaining, setRemaining] = useState(timeout)
  const [open, setOpen] = useState(false); //opens modal to prompt user for active session

  // if user becomes idle, then user will be signed out
  const onIdle = () => {  
    setOpen(false)
    // remove data from local storage before signing out
    localStorage.removeItem('project');
    localStorage.removeItem('organization');
    
    signOut();
  }

  //if user is active then modal will remain closed
  const onActive = () => {
    setOpen(false)
  }

  // show modal to promt user to state active presence
  const onPrompt = () => {
    setOpen(true)    
  }

  const { getRemainingTime, activate } = useIdleTimer({
    onIdle,
    onActive,
    onPrompt,
    timeout,
    promptBeforeIdle,
    throttle: 500
  })

   // Resets time so that users are not logged out
  const handleStillHere = () => {
    activate()
  }

  // The user will be shown the amount of time before user is logged out
  useEffect(() => {    
    if(open){
      const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000))
    }, 500)

    return () => {
      clearInterval(interval)
    }}
  });

  return (
    <div
      style={{
        display: open ? 'flex' : 'none',
        ...modalStyle,
      }}>
      <h3>Are you still here?</h3>
      <p>Logging out in {remaining} seconds</p>
      <Button variant='secondary' onClick={handleStillHere} size='sm'>Im still here</Button>
    </div>      
  )
}

export default IdleUserDetector
