const redis = require('./redis');

const getRecordsByPattern = (key) => {
  return redis.keys(key);
}

const deleteRecord = async (key) => {
  await redis.del(key);
}

const deleteRecordsByPattern = async (key) => {
  const records = await getRecordsByPattern(key);

  if (records.length) {
    const promises = records.map((e) => deleteRecord(e));
    await Promise.all(promises);
  }

  console.log('removed', records.length, 'records');
}

(async () => {
  await deleteRecordsByPattern('*:LAST_NOTIFICATION');
})();