import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/components/Tab.module.css'

// import Map from '../components/Map';


const CustomTab= ({tabs}) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
    {/* <div> */}
      <div className={styles['tab-links']}>
        {tabs.map((tab, index) => (
          <NavLink
            key={index}
            onClick={() => setActiveTab(index)}
            // className={ ? styles.active : styles.link}
            className={styles.link}
            style={activeTab === index ? {background: '#F2F3CC'} : null} 
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <div className={styles['content-wrapper']}>
        {tabs[activeTab].content}

      </div>   
    </>
  )
}

export default CustomTab