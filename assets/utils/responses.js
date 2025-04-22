// responsesToCollection :: Array -> Array
// responsesToCollection :: [{data: [1, 2]}, {data: [3, 4]}] -> [1, 2, 3, 4]
export const responsesToCollection = responses => responses.reduce((a, v) => a.concat(v.data), []);

// getContentRangeSize :: String -> Integer
// getContentRangeSize :: "Content-Range: items 0-137/138" -> 138
export const getContentRangeSize = header => +/(\w+) (\d+)-(\d+)\/(\d+)/g.exec(header)[4];

// getCollectionAndTotal :: Object -> Object
// getCollectionAndTotal :: { data, headers } -> { collection, total }
export const getCollectionAndTotal = ({ data, headers }) => ({
    collection: data,
    total: headers['content-range'] && getContentRangeSize(headers['content-range']),
})