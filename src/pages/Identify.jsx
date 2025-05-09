/**
This component is where users can identify species. 
 */
import { useMemo } from 'react';
import IdentifySpecies from '../components/identify/speciesTab/IdentifySpecies';
import { useLazyQuery } from '@apollo/client';
import { GET_IMAGES_BY_FILTER } from '../api/identifyGql';
import IdentifyContext from '../components/identify/IdentifyContext';

const IdentifyPage = ({nhost}) => {
  const [getImages, { loading, error, data, refetch }] = useLazyQuery(GET_IMAGES_BY_FILTER, {
    fetchPolicy: 'no-cache'
  });

  const contextValue = useMemo(() => ({
    getImages: getImages,
    data: data?.images,
    refetchImages: refetch,
    nhost: nhost,
    loading: loading
  }), [data?.images, loading]);

  // if (loading) return <Spinner />;

  if(error) {
    console.log(error)
    return <div>Something went wrong! Please try again.</div>
  }

  return (   
    <IdentifyContext.Provider value={contextValue}>
      <IdentifySpecies nhost={nhost} />
    </IdentifyContext.Provider> 
  )
}

export default IdentifyPage