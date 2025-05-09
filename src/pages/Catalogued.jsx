/*
This component is where users can view catalouged data (metadata of images where species
have been identified). Users must use the filter options to fetch data.
*/
import Catalogued from '../components/catalogued/Catalogued';
import { useLazyQuery } from '@apollo/client';
import { GET_CATALOGUED_BY_FILTER } from '../api/cataloguedGql';
import FilterOptions from '../components/catalogued/FilterOptions';

const CataloguedPage = ({nhost}) => {
  const [getCatalogue, { loading, error, data}] = useLazyQuery(GET_CATALOGUED_BY_FILTER, {
    fetchPolicy: 'no-cache'
  });

  if(error) {
    console.log(error)
    return <div>Something went wrong! Please try again.</div>
  }

  return (
    <>
    <FilterOptions fetchData={getCatalogue} loading={loading} />
    <Catalogued data={data?.images} nhost={nhost} /> 
    </>
  )
}

export default CataloguedPage