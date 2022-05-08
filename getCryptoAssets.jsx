const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num );
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });
  //JSON.stringify(data);
  //console.log("usedataapi " + state + data.value);


  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const res = await axios(url);
        //console.log('res', result);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: res.data });
          //console.log(`payload = ${result.payload}`);
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  //console.log(`result = ${result.payload}`);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// App that gets data from crypto url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  //const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://nova.bitcambio.com.br/api/v3/public/getassets",
    {
      result: []
    }
  );
  //console.log(`Render App: ${JSON.stringify(data)}`);
  console.log("data result = " + data.result); //data yields object but I want array of items in it
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.result;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <table>
          <th>Asset</th><th>Long name</th><th>Symbol, if avail</th>
          <tbody>
          {page.map(item => (
            <tr>
            <td key={item.Asset}>
             {item.Asset} 
            </td>
            <td>
            {item.AssetLong}
            </td>
            <td>
              {item.FormatPrefix}
            </td>
            </tr>
          ))}
        </tbody></table>
      )}
      <Pagination
        items={data.result}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
//import {createRoot} from 'react-dom/client';
//const container = document.getElementById('root');
//const root = createRoot(container);
//root.render(<App />);
ReactDOM.render(<App />, document.getElementById("root"));
