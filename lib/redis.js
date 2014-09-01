/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/22/13
 * Time: 3:58 PM
 */

/** @module Redis */

/*global require, exports */

"use strict";

var {JedisPool,JedisPoolConfig} = Packages.redis.clients.jedis;

var pools = {};
//    var pool = new JedisPool(new JedisPoolConfig(), "localhost");

//    public JedisPool(org.apache.commons.pool.impl.GenericObjectPool.Config poolConfig,
//                     String host,
//                     int port,
//                     int timeout,
//                     String password,
//                     int database)

/**
 * Create a new Redis connection
 *
 * @param config
 * @constructor
 */
function Redis(config) {
    config = config || {};
    config = decaf.extend({
        host    : 'localhost',
        port    : 6379,
        timeout : 0,
        db      : 0,
        password: ''
    }, config);
    var key = config.host + '-' + config.port + '-' + config.db;
    if (!pools[key]) {
//            pools[key] = new JedisPool(new JedisPoolConfig(), config.host, config.port, config.timeout, config.password, config.db);
        pools[key] = new JedisPool(new JedisPoolConfig(), 'localhost');
    }
    this.pool = pools[key];
    this.redis = this.pool.getResource();
}

decaf.extend(Redis.prototype, {
    /**
     * Destroy this redis connection.  Free any resources used.
     */
    destroy: function () {
        this.pool.returnResource(this.redis);
    },

    /**
     * Assure redis connection is still alive.
     *
     * @returns {string} 'PONG'
     */
    ping: function () {
        return this.redis.ping();
    },

    /**
     * Set the string value as value of the key. The string can't be longer than 1073741824 bytes (1 GB).
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key
     * @param {string} value value to set
     * @returns {string} status code reply
     */
    set: function (key, value) {
        return this.redis.set(key, value);
    },

    /**
     * Get the value of the specified key. If the key does not exist the special value 'nil' is returned. If the value stored at key is not a string an error is returned because GET can only handle string values.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key
     * @returns {string} the value of the specified key
     */
    get: function (key) {
        return this.redis.get(key);
    },

    /**
     * Ask the server to silently close the connection.
     *
     * @returns {string} status reply code
     */
    quit: function () {
        return this.redis.quit();
    },

    /**
     * Test if the specified key exists.
     *
     * The command returns "1" if the key exists, otherwise "0" is returned.
     *
     * Note that even keys set with an empty string as value will return "1".
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key
     * @returns {boolean} true if the key exists, otherwise false
     */
    exists: function (key) {
        return this.redis.exists(key);
    },

    /**
     * Remove the specified keys. If a given key does not exist no operation is performed for this key. The command returns the number of keys removed.
     *
     * Time complexity: O(1)
     *
     * @param {...} keys one or more keys to remove
     * @returns {int} an integer greater than 0 if one or more keys were removed 0 if none of the specified key existed
     */
    del: function (keys) {
        return this.redis.del(arguments);
    },

    /**
     * Return the type of the value stored at key in form of a string.
     *
     * The type can be one of "none", "string", "list", "set". "none" is returned if the key does not exist.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key
     * @returns {string} Status code reply, specifically: "none" if the key does not exist "string" if the key contains a String value "list" if the key contains a List value "set" if the key contains a Set value "zset" if the key contains a Sorted Set value "hash" if the key contains a Hash value
     */
    type: function (key) {
        return this.redis.type(key);
    },

    /**
     * Delete all the keys of the currently selected DB. This command never fails.
     *
     * @returns {string} status code reply
     */
    flushDB: function () {
        return this.redis.flushDB();
    },

    /**
     * Returns all the keys matching the glob-style pattern as space separated strings.
     *
     * For example if you have in the database the keys "foo" and "foobar" the command "KEYS foo*" will return "foo foobar".
     *
     * Note that while the time complexity for this operation is O(n) the constant times are pretty low. For example Redis running on an entry level laptop can scan a 1 million keys database in 40 milliseconds. Still it's better to consider this one of the slow commands that may ruin the DB performance if not used with care.
     *
     * In other words this command is intended only for debugging and special operations like creating a script to change the DB schema. Don't use it in your normal code. Use Redis Sets in order to group together a subset of objects.
     *
     * Glob style patterns examples:
     *
     * - h?llo will match hello hallo hhllo
     * - h*llo will match hllo heeeello
     * - h[ae]llo will match hello and hallo, but not hillo
     *
     * Use \ to escape special chars if you want to match them verbatim.
     *
     * Time complexity: O(n) (with n being the number of keys in the DB, and assuming keys and pattern of limited length)
     *
     * @param pattern glob style pattern
     * @returns {array} array of keys
     */
    keys: function (pattern) {
        return this.redis.keys(pattern);
    },

    /**
     * Return a randomly selected key from the currently selected DB.
     *
     * Time complexity: O(1)
     *
     * @returns {string} the rendomly selected key or an empty string if the database is empty
     */
    randomKey: function () {
        return this.redis.randomKey();
    },

    /**
     * Atomically renames the key oldkey to newkey.
     *
     * If the source and destination name are the same an error is returned.
     *
     * If newkey already exists it is overwritten.
     *
     * Time complexity: O(1)
     *
     * @param {string} oldKey existing key
     * @param {string} newKey new name for key
     * @returns {string} status code reply
     */
    rename: function (oldKey, newKey) {
        return this.redis.rename(oldKey, newKey);
    },

    /**
     * Rename oldkey into newkey but fails if the destination key newkey already exists.
     *
     * Time complexity: O(1)
     *
     * @param {string} oldKey existing key
     * @param {string} newKey new name for key
     * @returns {int} 1 if the key was renamed, 0 if the target key already exists.
     */
    renamenx: function (oldKey, newKey) {
        return this.redis.renamenx(oldKey, newKey);
    },

    /**
     * Set a timeout on the specified key. After the timeout the key will be automatically deleted by the server.
     *
     * A key with an associated timeout is said to be volatile in Redis terminology.
     *
     * Voltile keys are stored on disk like the other keys, the timeout is persistent too like all the other aspects of the dataset. Saving a dataset containing expires and stopping the server does not stop the flow of time as Redis stores on disk the time when the key will no longer be available as Unix time, and not the remaining seconds.
     *
     * Since Redis 2.1.3 you can update the value of the timeout of a key already having an expire set. It is also possible to undo the expire at all turning the key into a normal key using the PERSIST command.
     *
     * Time complexity: O(1)
     *
     * @param {string} key
     * @param {int} seconds
     * @returns {int} 1: the timeout was set. 0: the timeout was not set since the key already has an associated timeout (this may happen only in Redis versions < 2.1.3, Redis >= 2.1.3 will happily update the timeout), or the key does not exist.
     */
    expire: function (key, seconds) {
        return thisredis.expire(key, seconds);
    },

    /**
     * EXPIREAT works exctly like EXPIRE but instead to get the number of seconds representing the Time To Live of the key as a second argument (that is a relative way of specifing the TTL), it takes an absolute one in the form of a UNIX timestamp (Number of seconds elapsed since 1 Gen 1970).
     *
     * EXPIREAT was introduced in order to implement the Append Only File persistence mode so that EXPIRE commands are automatically translated into EXPIREAT commands for the append only file. Of course EXPIREAT can also used by programmers that need a way to simply specify that a given key should expire at a given time in the future.
     *
     * Since Redis 2.1.3 you can update the value of the timeout of a key already having an expire set. It is also possible to undo the expire at all turning the key into a normal key using the PERSIST command.
     *
     * Time complexity: O(1)
     *
     * @param {string} key
     * @param {int} unixTime
     * @returns {int} 1: the timeout was set. 0: the timeout was not set since the key already has an associated timeout (this may happen only in Redis versions < 2.1.3, Redis >= 2.1.3 will happily update the timeout), or the key does not exist.
     */
    expireAt: function (key, unixTime) {
        return this.redis.expireAt(key, unixTime);
    },

    /**
     * The TTL command returns the remaining time to live in seconds of a key that has an EXPIRE set. This introspection capability allows a Redis client to check how many seconds a given key will continue to be part of the dataset.
     *
     * @param {string} key name of key
     * @returns {int} Integer reply, returns the remaining time to live in seconds of a key that has an EXPIRE. If the Key does not exists or does not have an associated expire, -1 is returned.
     */
    ttl: function (key) {
        return this.redis.expireAt(key);
    },

    /**
     * Select the DB with having the specified zero-based numeric index.
     *
     * For default every new client connection is automatically selected to DB 0.
     *
     * @param {int} dbIndex index of database to select
     * @returns {string} status code reply
     */
    select: function (dbIndex) {
        return this.redis.select(dbIndex);
    },

    /**
     * Move the specified key from the currently selected DB to the specified destination DB.
     *
     * Note that this command returns 1 only if the key was successfully moved, and 0 if the target key was already there or if the source key was not found at all, so it is possible to use MOVE as a locking primitive.
     *
     * @param {string} key name of key
     * @param {int} dbIndex index of target database
     * @returns {int} 1 if the key was moved 0 if the key was not moved because already present on the target DB or was not found in the current DB.
     */
    move: function (key, dbIndex) {
        return this.redis.move(key, dbIndex);
    },

    /**
     * Delete all the keys of all the existing databases, not just the currently selected one.
     *
     * This command never fails.
     *
     * @returns {string} status code reply
     */
    flushAll: function () {
        return this.redis.flushAll();
    },

    /**
     * GETSET is an atomic set this value and return the old value command.
     *
     * Set key to the string value and return the old value stored at key. The string can't be longer than 1073741824 bytes (1 GB).
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key
     * @param {string} value new value
     * @returns {string} old value
     */
    getSet: function (key, value) {
        return this.redis.getSet(key, value);
    },

    /**
     * Get the values of all the specified keys.
     *
     * If one or more keys dont exist or is not of type String, a 'nil' value is returned instead of the value of the specified key, but the operation never fails.
     *
     * Time complexity: O(1) for every key
     *
     * @param {...} keys one or more keys to get values of
     * @returns {array} values of specified keys
     */
    mget: function (keys) {
        return this.redis.select(arguments);
    },

    /**
     * SETNX works exactly like SET with the only difference that if the key already exists no operation is performed.
     *
     * SETNX actually means "SET if Not eXists".
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key
     * @param {string} value value to set
     * @returns {int} 1 if key was set, 0 if key was not set
     */
    setnx: function (key, value) {
        return this.redis.setnx(key, value);
    },

    /**
     * The command is exactly equivalent to the following group of commands: SET + EXPIRE.
     *
     * The operation is atomic.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key
     * @param {int} seconds expire time in seconds
     * @param {string} value value for key
     * @returns {string} status code reply
     */
    setex: function (key, seconds, value) {
        return this.redis.setex(key, seconds, value);
    },

    /**
     * Set the the respective keys to the respective values.
     *
     * MSET will replace old values with new values, while MSETNX will not perform any operation at all even if just a single key already exists.
     *
     * Because of this semantic MSETNX can be used in order to set different keys representing different fields of an unique logic object in a way that ensures that either all the fields or none at all are set.
     *
     * Both MSET and MSETNX are atomic operations. This means that for instance if the keys A and B are modified, another client talking to Redis can either see the changes to both A and B at once, or no modification at all.
     *
     * @param {array} keysvalues
     * @returns {string} Status code reply.  Basically +OK as MSET can't fail
     */
    mset: function (keysvalues) {
        return this.redis.mset(arguments);
    },

    /**
     * Set the the respective keys to the respective values.
     *
     * MSET will replace old values with new values, while MSETNX will not perform any operation at all even if just a single key already exists.
     *
     * Because of this semantic MSETNX can be used in order to set different keys representing different fields of an unique logic object in a way that ensures that either all the fields or none at all are set.
     *
     * Both MSET and MSETNX are atomic operations. This means that for instance if the keys A and B are modified, another client talking to Redis can either see the changes to both A and B at once, or no modification at all.
     *
     * @param {array} keysvalues
     * @returns {int} 1 if the all the keys were set 0 if no key was set (at least one key already existed)
     */
    msetnx: function (keysvalues) {
        return this.redis.msetnx(arguments);
    },

    /**
     * IDECRBY work just like INCR but instead of doing a decrement by 1 the decrement is integer.
     *
     * INCR commands are limited to 64 bit signed integers.
     *
     * Note: this is actually a string operation, that is, in Redis there are not "integer" types. Simply the string stored at the key is parsed as a base 10 64 bit signed integer, incremented, and then converted back as a string.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key to decrement
     * @param {int} amount to decrement by
     * @returns {int} value after the decrement
     */
    decrBy: function (key, amount) {
        return this.redis.decrBy(key, amount);
    },

    /**
     * Decrement the number stored at key by one.
     *
     * If the key does not exist or contains a value of a wrong type, set the key to the value of "0" before to perform the decrement operation.
     *
     * DECR commands are limited to 64 bit signed integers.
     *
     * Note: this is actually a string operation, that is, in Redis there are not "integer" types. Simply the string stored at the key is parsed as a base 10 64 bit signed integer, incremented, and then converted back as a string.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key to decrement
     * @returns {int} value after the decrement
     */
    decr: function (key) {
        return this.redis.decr(key);
    },

    /**
     * INCRBY work just like INCR but instead of doing an increment by 1 the increment is integer.
     *
     * INCR commands are limited to 64 bit signed integers.
     *
     * Note: this is actually a string operation, that is, in Redis there are not "integer" types. Simply the string stored at the key is parsed as a base 10 64 bit signed integer, incremented, and then converted back as a string.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key to increment
     * @param {int} amount to increment by
     * @returns {int} value after the increment
     */
    incrBy: function (key, amount) {
        return this.redis.incrBy(key, amount);
    },

    /**
     * Increment the number stored at key by one.
     *
     * If the key does not exist or contains a value of a wrong type, set the key to the value of "0" before to perform the increment operation.
     *
     * INCR commands are limited to 64 bit signed integers.
     *
     * Note: this is actually a string operation, that is, in Redis there are not "integer" types. Simply the string stored at the key is parsed as a base 10 64 bit signed integer, incremented, and then converted back as a string.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key to increment
     * @returns {int} value after the increment
     */
    incr: function (key) {
        return this.redis.incr(key);
    },

    /**
     * If the key already exists and is a string, this command appends the provided value at the end of the string.
     *
     * If the key does not exist it is created and set as an empty string, so APPEND will be very similar to SET in this special case.
     *
     * Time complexity: O(1). The amortized time complexity is O(1) assuming the appended value is small and the already present value is of any size, since the dynamic string library used by Redis will double the free space available on every reallocation.
     *
     * @param {string} key name of key
     * @param {string} value value to append
     * @returns {int} the total length of the string after the append operation
     */
    append: function (key, value) {
        return this.redis.append(key, value);
    },

    /**
     * Return a subset of the string from offset start to offset end (both offsets are inclusive). Negative offsets can be used in order to provide an offset starting from the end of the string. So -1 means the last char, -2 the penultimate and so forth.
     *
     * The function handles out of range requests without raising an error, but just limiting the resulting range to the actual length of the string.
     *
     * Time complexity: O(start+n) (with start being the start index and n the total length of the requested range). Note that the lookup part of this command is O(1) so for small strings this is actually an O(1) command.
     *
     * @param {string} key
     * @param {int} start
     * @param {int} end
     * @returns {string}
     */
    substr: function (key, start, end) {
        return this.redis.substr(key, start, end);
    },

    /**
     * Set the specified hash field to the specified value.
     *
     * If key does not exist, a new key holding a hash is created.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of hash
     * @param {string} field name of field
     * @param {string} value value to set
     * @returns {int} If the field already exists, and the HSET just produced an update of the value, 0 is returned, otherwise if a new field is created 1 is returned.
     */
    hset: function (key, field, value) {
        return this.redis.hset(key, field, value);
    },

    /**
     * If key holds a hash, retrieve the value associated to the specified field.
     *
     * If the field is not found or the key does not exist, a special 'nil' value is returned.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of hash
     * @param {string} field name of field
     * @returns {string} result value of field
     */
    hget: function (key, field) {
        return this.redis.hget(key, field);
    },

    /**
     * Set the specified hash field to the specified value if the field not exists.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of hash
     * @param {string} field name of field
     * @param {string} value value to set
     * @returns {int} If the field already exists, 0 is returned, otherwise if a new field is created 1 is returned.
     */
    hsetnx: function (key, field, value) {
        return this.redis.hsetnx(key, field, value);
    },

    /**
     * Set the respective fields to the respective values.
     *
     * HMSET replaces old values with new values.
     *
     * If key does not exist, a new key holding a hash is created.
     *
     * Time complexity: O(N) (with N being the number of fields)
     *
     * @param {string} key name of hash
     * @param {object} hash key/value pairs to set
     * @returns {string} Status result
     */
    hmset: function (key, hash) {
        return this.redis.hmset(key, hash);
    },

    /**
     * Retrieve the values associated to the specified fields.
     *
     * If some of the specified fields do not exist, nil values are returned. Non existing keys are considered like empty hashes.
     *
     * Time complexity: O(N) (with N being the number of fields)
     *
     * @param {string} key name of hash
     * @param {...} fields fields to get
     * @returns {array} array of values
     */
    hmget: function (key, fields) {
        return this.redis.hmget(arguments);
    },

    /**
     * Increment the number stored at field in the hash at key by value.
     *
     * If key does not exist, a new key holding a hash is created.
     *
     * If field does not exist or holds a string, the value is set to 0 before applying the operation.
     *
     * Since the value argument is signed you can use this command to perform both increments and decrements.
     *
     * The range of values supported by HINCRBY is limited to 64 bit signed integers.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of hash
     * @param {string} field name of field
     * @param {int} value value to add
     * @returns {int} new value after the operation
     */
    hincrBy: function (key, field, value) {
        return this.redis.hincrBy(key, field, value);
    },

    /**
     * Test for existence of a specified field in a hash.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of hash
     * @param {string} field name of field in hash
     * @returns {int} 1 if the hash stored at key contains the specified field. Return 0 if the key is not found or the field is not present.
     */
    hexists: function (key, field) {
        return this.redis.hexists(key, field);
    },

    /**
     * Remove the specified field from an hash stored at key.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of hash
     * @param {...} fields field names in hash to delete
     * @returns {int} number of fields deleted
     */
    hdel: function (key, fields) {
        return this.redis.hdel(arguments);
    },

    /**
     * Return the number of items in a hash.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of hash
     * @returns {int} The number of entries (fields) contained in the hash stored at key. If the specified key does not exist, 0 is returned assuming an empty hash.
     */
    hlen: function (key) {
        return this.redis.hlen(key);
    },

    /**
     * Return all the fields in a hash.
     *
     * Time complexity: O(N), where N is the total number of entries
     *
     * @param {string} key name of hash
     * @returns {array} All the field names contained in the hash
     */
    hkeys: function (key) {
        return this.redis.hkeys(key);
    },

    /**
     * Return all the values in a hash.
     *
     * Time complexity: O(N), where N is the total number of entries
     *
     * @param {string} key name of hash
     * @returns {array} array of field values
     */
    hvals: function (key) {
        return this.redis.hvals(key);
    },

    /**
     * Return all the fields and associated values in a hash.
     *
     * @param {string} key name of hash
     * @returns {object} hash turned into a Java map
     */
    hgetAll: function (key) {
        return this.redis.hgetAll(key);
    },

    /**
     * Add the string value to the head (LPUSH) or tail (RPUSH) of the list stored at key.
     *
     * If the key does not exist an empty list is created just before the append operation.
     *
     * If the key exists but is not a List an error is returned.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of hash
     * @param {...} strings values to push
     * @returns {int} the number of elements inside the list after the push operation.
     */
    rpush: function (key, strings) {
        return this.redis.rpush(arguments);
    },

    /**
     * Add the string value to the head (LPUSH) or tail (RPUSH) of the list stored at key.
     *
     * If the key does not exist an empty list is created just before the append operation.
     *
     * If the key exists but is not a List an error is returned.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of hash
     * @param {...} strings values to push
     * @returns {int} the number of elements inside the list after the push operation.
     */
    lpush: function (key, strings) {
        return this.redis.lpush(arguments);
    },

    /**
     * Return the length of the list stored at the specified key.
     *
     * If the key does not exist zero is returned (the same behaviour as for empty lists).
     *
     * If the value stored at key is not a list an error is returned.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of list
     * @returns {int} length of the list
     */
    llen: function (key) {
        return this.redis.llen(key);
    },

    /**
     * Return the specified elements of the list stored at the specified key.
     *
     * Start and end are zero-based indexes. 0 is the first element of the list (the list head), 1 the next element and so on.
     *
     * For example LRANGE foobar 0 2 will return the first three elements of the list.
     *
     * start and end can also be negative numbers indicating offsets from the end of the list.
     *
     * For example -1 is the last element of the list, -2 the penultimate element and so on.
     *
     * Consistency with range functions in various programming languages
     *
     * Note that if you have a list of numbers from 0 to 100, LRANGE 0 10 will return 11 elements, that is, rightmost item is included. This may or may not be consistent with behavior of range-related functions in your programming language of choice (think Ruby's Range.new, Array#slice or Python's range() function).
     *
     * LRANGE behavior is consistent with one of Tcl.
     *
     * _Out-of-range indexes_
     *
     * Indexes out of range will not produce an error: if start is over the end of the list, or start > end, an empty list is returned. If end is over the end of the list Redis will threat it just like the last element of the list.
     *
     * Time complexity: O(start+n) (with n being the length of the range and start being the start offset)
     *
     * @param {string} key name of list
     * @param {int} start start index
     * @param {int} end end index
     * @returns {array} array of elements
     */
    lrange: function (key, start, end) {
        return this.redis.lrange(key, start, end);
    },

    /**
     * Trim an existing list so that it will contain only the specified range of elements specified.
     *
     * Start and end are zero-based indexes. 0 is the first element of the list (the list head), 1 the next element and so on.
     *
     * For example LTRIM foobar 0 2 will modify the list stored at foobar key so that only the first three elements of the list will remain.
     *
     * start and end can also be negative numbers indicating offsets from the end of the list. For example -1 is the last element of the list, -2 the penultimate element and so on.
     *
     * Indexes out of range will not produce an error: if start is over the end of the list, or start > end, an empty list is left as value. If end over the end of the list Redis will threat it just like the last element of the list.
     *
     * Hint: the obvious use of LTRIM is together with LPUSH/RPUSH. For example:
     *
     * lpush("mylist", "someelement"); ltrim("mylist", 0, 99); *
     *
     * The above two commands will push elements in the list taking care that the list will not grow without limits. This is very useful when using Redis to store logs for example. It is important to note that when used in this way LTRIM is an O(1) operation because in the average case just one element is removed from the tail of the list.
     *
     * Time complexity: O(n) (with n being len of list - len of range)
     *
     * @param {string} key name of list
     * @param {int} start start index
     * @param {int} end end index
     * @returns {string} status code reply
     */
    ltrim: function (key, start, end) {
        return this.redis.ltrim(key, start, end);
    },

    /**
     * Return the specified element of the list stored at the specified key.
     *
     * 0 is the first element, 1 the second and so on. Negative indexes are supported, for example -1 is the last element, -2 the penultimate and so on.
     *
     * If the value stored at key is not of list type an error is returned. If the index is out of range a 'nil' reply is returned.
     *
     * Note that even if the average time complexity is O(n) asking for the first or the last element of the list is O(1).
     *
     * Time complexity: O(n) (with n being the length of the list)
     *
     * @param {string} key name of list
     * @param {int} index index of element to get
     * @returns {string} the requested element
     */
    lindex: function (key, index) {
        return this.redis.lindex(key, index);
    },

    /**
     * Set a new value as the element at index position of the List at key.
     *
     * Out of range indexes will generate an error.
     *
     * Similarly to other list commands accepting indexes, the index can be negative to access elements starting from the end of the list. So -1 is the last element, -2 is the penultimate, and so forth.
     *
     * Time complexity: O(N) (with N being the length of the list), setting the first or last elements of the list is O(1).
     *
     * @param {string} key name of list
     * @param {int} index index of element to set
     * @param {string} value value to set
     * @returns {string} status code reply
     */
    lset: function (key, index, value) {
        return this.redis.lset(key, index, value);
    },

    /**
     * Remove the first count occurrences of the value element from the list.
     *
     * If count is zero all the elements are removed.
     *
     * If count is negative elements are removed from tail to head, instead to go from head to tail that is the normal behaviour. So for example LREM with count -2 and hello as value to remove against the list (a,b,c,hello,x,hello,hello) will lave the list (a,b,c,hello,x). The number of removed elements is returned as an integer, see below for more information about the returned value. Note that non existing keys are considered like empty lists by LREM, so LREM against non existing keys will always return 0.
     *
     * Time complexity: O(N) (with N being the length of the list)
     *
     * @param {string} key name of list
     * @param {int} count number of elements to remove
     * @param {string} value value of elements to remove
     * @returns {int} The number of removed elements if the operation succeeded
     */
    lrem: function (key, count, value) {
        return this.redis.lrem(key, count, value);
    },

    /**
     * Atomically return and remove the first element of the list.
     *
     * For example if the list contains the elements "a","b","c" LPOP will return "a" and the list will become "b","c".
     *
     * If the key does not exist or the list is already empty the special value 'nil' is returned.
     *
     * @param {string} key name of list
     * @returns {string} element from list
     */
    lpop: function (key) {
        return this.redis.lpop(key);
    },

    /**
     * Atomically return and remove the first last element of the list.
     *
     * For example if the list contains the elements "a","b","c" RPOP will return "c" and the list will become "a","b".
     *
     * If the key does not exist or the list is already empty the special value 'nil' is returned.
     *
     * @param {string} key name of list
     * @returns {string} element from list
     */
    rpop: function (key) {
        return this.redis.rpop(key);
    },

    /**
     * Atomically return and remove the last (tail) element of the srckey list, and push the element as the first (head) element of the dstkey list.
     *
     * For example if the source list contains the elements "a","b","c" and the destination list contains the elements "foo","bar" after an RPOPLPUSH command the content of the two lists will be "a","b" and "c","foo","bar".
     *
     * If the key does not exist or the list is already empty the special value 'nil' is returned. If the srckey and dstkey are the same the operation is equivalent to removing the last element from the list and pusing it as first element of the list, so it's a "list rotation" command.
     *
     * Time complexity: O(1)
     *
     * @param {string} srcKey name of source list
     * @param {string} dstKey name of destination list
     * @returns {string} value that was popped and pushed
     */
    rpoplpush: function (srcKey, dstKey) {
        return this.redis.rpoplpush(srcKey, dstKey);
    },

    /**
     * Add the specified members to the set value stored at key.
     *
     * If member is already a member of the set no operation is performed.
     *
     * If key does not exist a new set with the specified member as sole member is created.
     *
     * If the key exists but does not hold a set value an error is returned.
     *
     * Time complexity O(1)
     *
     * @param {string} key name of set
     * @param {...} members members to add to set
     * @returns {int} number of members actually added to set
     */
    sadd: function (key, members) {
        return this.redis.sadd(arguments);
    },

    /**
     * Return all the members (elements) of the set value stored at key.
     *
     * This is just syntax glue for SINTER.
     *
     * Time complexity O(N)
     *
     * @param {string} key name of set
     * @returns {array} array of elements in set
     */
    smembers: function (key) {
        return this.redis.smembers(key);
    },

    /**
     * Remove the specified members from the set value stored at key.
     *
     * If member was not a member of the set no operation is performed.
     *
     * If key does not hold a set value an error is returned.
     *
     * Time complexity O(1)
     *
     * @param {string} key name of set
     * @param {...} members members to remove
     * @returns {int} number of members actually removed
     */
    srem: function (key, members) {
        return this.redis.srem(arguments);
    },

    /**
     * Remove a random element from a Set returning it as return value.
     *
     * If the Set is empty or the key does not exist, a nil object is returned.
     *
     * The srandmember(String) command does a similar work but the returned element is not removed from the Set.
     *
     * Time complexity O(1)
     *
     * @param {string} key name of set
     * @returns {string} element removed from set
     */
    spop: function (key) {
        return this.redis.spop(key);
    },

    /**
     * Move the specifided member from the set at srckey to the set at dstkey.
     *
     * This operation is atomic, in every given moment the element will appear to be in the source or destination set for accessing clients.
     *
     * If the source set does not exist or does not contain the specified element no operation is performed and zero is returned, otherwise the element is removed from the source set and added to the destination set.
     *
     * On success one is returned, even if the element was already present in the destination set.
     *
     * An error is raised if the source or destination keys contain a non Set value.
     *
     * Time complexity O(1)
     *
     * @param {string} srcKey name of source set
     * @param {string} dstKey name of destination set
     * @param {string} member member to move
     * @returns {int} 1 if the element was moved 0 if the element was not found on the first set and no operation was performed
     */
    smove: function (srcKey, dstKey, member) {
        return this.redis(srcKey, dstKey, member);
    },

    /**
     * Return the set cardinality (number of elements).
     *
     * If the key does not exist 0 is returned, like for empty sets.
     *
     * @param {string} key name of set
     * @returns {int} number of elements
     */
    scard: function (key) {
        return this.redis.scard(key);
    },

    /**
     * Return 1 if member is a member of the set stored at key, otherwise 0 is returned.
     *
     * Time complexity O(1)
     *
     * @param {string} key name of set
     * @param {string} member member to test existence
     * @returns {int} 1 if the element is a member of the set 0 if the element is not a member of the set OR if the key does not exist
     */
    sismember: function (key, member) {
        return this.redis.sismember(key, member);
    },

    /**
     * Return the members of a set resulting from the intersection of all the sets hold at the specified keys.
     *
     * Like in LRANGE the result is sent to the client as a multi-bulk reply (see the protocol specification for more information).
     *
     * If just a single key is specified, then this command produces the same result as SMEMBERS.
     *
     * Actually SMEMBERS is just syntax sugar for SINTER.
     *
     * Non existing keys are considered like empty sets, so if one of the keys is missing an empty set is returned (since the intersection with an empty set always is an empty set).
     *
     * Time complexity O(N*M) worst case where N is the cardinality of the smallest set and M the number of sets
     *
     * @param {...} keys names of sets to get intersection of
     * @returns {array} resulting set that is the intersection of the above sets
     */
    sinter: function (keys) {
        return this.redis.sinter(arguments);
    },

    /**
     * This command works exactly like SINTER but instead of being returned the resulting set is stored as dstKey.
     *
     * If destKey exists, it is overwritten.
     *
     * Time complexity O(N*M) worst case where N is the cardinality of the smallest set and M the number of sets
     *
     * @param {string} dstKey name of set to create
     * @param {...} keys names of sets to get intersection of
     * @returns {int} the number of elements in the resulting set
     */
    sinterstore: function (dstKey, keys) {
        return this.redis.sinterstore(arguments);
    },

    /**
     * Return the members of a set resulting from the union of all the sets hold at the specified keys.
     *
     * Like in LRANGE the result is sent to the client as a multi-bulk reply (see the protocol specification for more information).
     *
     * If just a single key is specified, then this command produces the same result as SMEMBERS.
     *
     * Non existing keys are considered like empty sets.
     *
     * Time complexity O(N) where N is the total number of elements in all the provided sets
     *
     * @param {...} keys names of sets to get union of
     * @returns {array} resulting set that is the union of the above sets
     */
    sunion: function (keys) {
        return this.redis.sunion(arguments);
    },

    /**
     * This command works exactly like SUNION but instead of being returned the resulting set is stored as dstKey.
     *
     * Any existing value in dstkey will be over-written.
     *
     * Time complexity O(N) where N is the total number of elements in all the provided sets
     *
     * @param {string} dstKey name of set to create
     * @param {...} keys names of sets to get union of
     * @returns {int} the number of elements in the resulting set
     */
    sunionstore: function (dstKey, keys) {
        return this.redis.sunionstore(arguments);
    },

    /**
     * Return the difference between the Set stored at key1 and all the Sets key2, ..., keyN
     *
     * Example:
     *
     *     key1 = [x, a, b, c]
     *     key2 = [c]
     *     key3 = [a, d]
     *     SDIFF key1,key2,key3 => [x, b]
     *
     * <br/>Non existing keys are considered like empty sets.
     *
     * Time complexity: O(N) with N being the total number of elements of all the sets
     *
     * @param {...} keys names of sets to get differences of
     * @returns {array} resulting set
     */
    sdiff: function (keys) {
        return this.redis.sdiff(arguments);
    },

    /**
     * This command works exactly like SDIFF but instead of being returned the resulting set is stored in dstKey.
     *
     * If dstKey exists, it is overwritten.
     *
     * @param {string} dstKey name of set to create
     * @param {...} keys names of sets to get differences of
     * @returns {int} the number of elements in the resulting set
     */
    sdiffstore: function (dstKey, keys) {
        return this.redis.sdiffstore(arguments);
    },

    /**
     * Return a random element from a Set, without removing the element.
     *
     * If the Set is empty or the key does not exist, a nil object is returned.
     *
     * The SPOP command does a similar work but the returned element is popped (removed) from the Set.
     *
     * Time complexity O(1)
     *
     * @param {string} key name of set
     * @returns {string} the random element returned
     */
    srandmember: function (key) {
        return this.redis.srandmember(key);
    },

    /**
     * Add the specified member having the specified score to the sorted set stored at key.
     *
     * If member is already a member of the sorted set the score is updated, and the element reinserted in the right position to ensure sorting.
     *
     * If key does not exist a new sorted set with the specified member as sole member is crated.
     *
     * If the key exists but does not hold a sorted set value an error is returned.
     *
     * The score value can be the string representation of a double precision floating point number.
     *
     * Time complexity O(log(N)) with N being the number of elements in the sorted set
     *
     * @param {string} key name of set
     * @param {number} score score value for member
     * @param {string} member member to add to set
     * @returns {int} 1 if the new element was added 0 if the element was already a member of the sorted set and the score was updated
     */
    zadd: function (key, score, member) {
        return this.redis.zadd(arguments);
    },

    /**
     * Returns the specified range of elements in the sorted set stored at key.
     *
     * The elements are considered to be ordered from the lowest to the highest score.
     *
     * Lexicographical order is used for elements with equal score.
     *
     * See ZREVRANGE when you need the elements ordered from highest to lowest score (and descending lexicographical order for elements with equal score).
     *
     * Both start and stop are zero-based indexes, where 0 is the first element, 1 is the next element and so on.
     * They can also be negative numbers indicating offsets from the end of the sorted set, with -1 being the last element of the sorted set, -2 the penultimate element and so on.
     *
     * Out of range indexes will not produce an error. If start is larger than the largest index in the sorted set, or start > stop, an empty list is returned. If stop is larger than the end of the sorted set Redis will treat it like it is the last element of the sorted set.
     *
     * @param {string} key name of set
     * @param {int} start start index
     * @param {int} end end index
     * @returns {array} the range of elements
     */
    zrange: function (key, start, end) {
        return this.redis.zrange(key, start, end);
    },

    /**
     * Returns the specified range of elements in the sorted list stored at key, along with their scores.
     *
     * The returned list will contain value1,score1,...,valueN,scoreN instead of value1,...,valueN, or an array of tuples.
     *
     * @param {string} key name of set
     * @param {int} start start index
     * @param {int} end end index
     * @returns {array} the range of elements and scores
     */
    zrangeWithScores: function (key, start, end) {
        return this.redis.zrangeWithScores(key, start, end);
    },

    /**
     * Remove the specified members from the sorted set value stored at key.
     *
     * If member was not a member of the set no operation is performed.
     *
     * If key does not not hold a set value an error is returned.
     *
     * Time complexity O(log(N)) with N being the number of elements in the sorted set
     *
     * @param {string} key name of set
     * @param {...} members one or more members to remove
     * @returns {int} the number of members actually removed
     */
    zrem: function (key, members) {
        return this.redis.zrem(arguments);
    },

    /**
     * Increment score of a member of sorted set.
     *
     * If member already exists in the sorted set adds the increment to its score and updates the position of the element in the sorted set accordingly.
     *
     * If member does not already exist in the sorted set it is added with increment as score (that is, like if the previous score was virtually zero).
     *
     * If key does not exist a new sorted set with the specified member as sole member is crated.
     *
     * If the key exists but does not hold a sorted set value an error is returned.
     *
     * The score value can be the string representation of a double precision floating point number.
     *
     * It's possible to provide a negative value to perform a decrement.
     *
     * For an introduction to sorted sets check the Introduction to Redis data types page.
     *
     * Time complexity O(log(N)) with N being the number of elements in the sorted set
     *
     * @param {string} key name of set
     * @param {number} score value to add to score
     * @param {string} member member whose score should be incremented
     * @returns {number} the new score
     */
    zincrBy: function (key, score, member) {
        return this.redis.zincrby(key, score, member);
    },

    /**
     * Return the rank (or index) or member in the sorted set at key, with scores being ordered from low to high.
     *
     * When the given member does not exist in the sorted set, the special value 'nil' is returned.
     *
     * The returned rank (or index) of the member is 0-based for both commands.
     *
     * Time complexity: O(log(N))
     *
     * @param {string} key name of set
     * @param {string} member member to get index of
     * @returns {int} index
     */
    zrank: function (key, member) {
        return this.redis.zrank(key, member);
    },

    /**
     * Returns the rank of member in the sorted set stored at key, with the scores ordered from high to low.
     *
     * The rank (or index) is 0-based, which means that the member with the highest score has rank 0.
     *
     * Use ZRANK to get the rank of an element with the scores ordered from low to high.
     *
     * @param {string} key name of set
     * @param {string} member to get index of
     * @returns {int} rank of member
     */
    zrevrank: function (key, member) {
        return this.redis.zreverank(key, member);
    },

    /**
     * Returns the specified range of elements in the sorted set stored at key.
     *
     * The elements are considered to be ordered from the highest to the lowest score.
     *
     * Descending lexicographical order is used for elements with equal score.
     *
     * Apart from the reversed ordering, ZREVRANGE is similar to ZRANGE.
     *
     * Time complexity: O(log(N)+M) with N being the number of elements in the sorted set and M the number of elements returned.
     *
     * @param {string} key name of set
     * @param {int} start start index
     * @param {int} end end index
     * @returns {array} range of elements
     */
    zrevrange: function (key, start, end) {
        return this.redis.zrevrange(key, start, end);
    },

    /**
     * Returns the specified range of elements in the sorted list stored at key, along with their scores.
     *
     * The elements are considered to be ordered from the highest to the lowest score.
     *
     * Descending lexicographical order is used for elements with equal score.
     *
     * The returned list will contain value1,score1,...,valueN,scoreN instead of value1,...,valueN, or an array of tuples.
     *
     * @param {string} key name of set
     * @param {int} start start index
     * @param {int} end end index
     * @returns {array} the range of elements and scores
     */
    zrevrangeWithScores: function (key, start, end) {
        return this.redis.zrevrangeWithScores(key, start, end);
    },

    /**
     * Return the sorted set cardinality (number of elements).
     *
     * If the key does not exist 0 is returned, like for empty sorted sets.
     *
     * Time complexity O(1)
     *
     * @param {string} key name of set
     * @returns {int} number of elements
     */
    zcard: function (key) {
        return this.redis.zcard(key);
    },

    /**
     * Return the score of the specified element of the sorted set at key.
     *
     * If the specified element does not exist in the sorted set, or the key does not exist at all, a special 'nil' value is returned.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of set
     * @param {string} member member of set to get score for
     * @returns {number} score
     */
    zscore: function (key, member) {
        return this.redis.zscore(key, member);
    },

    /**
     * Marks the given keys to be watched for conditional execution of a transaction.
     *
     * Available since 2.2.0.
     *
     * Time complexity: O(1) for every key.
     *
     * @param {...} keys names of keys to be watched
     * @returns {string} always OK
     */
    watch: function (keys) {
        return this.redis.watch(arguments);
    },

//        /**
//         *
//         * @param {string} key
//         * @returns {array}
//         */
//        sort: function(key) {
//            return this.redis.sort(arguments);
//        },

    /**
     * BLPOP (and BRPOP) is a blocking list pop primitive.
     *
     * You can see this commands as blocking versions of LPOP and RPOP able to block if the specified keys don't exist or contain empty lists.
     *
     * The following is a description of the exact semantic. We describe BLPOP but the two commands are identical, the only difference is that BLPOP pops the element from the left (head) of the list, and BRPOP pops from the right (tail).
     *
     * <b>Non blocking behavior</b>
     *
     * When BLPOP is called, if at least one of the specified keys contain a non empty list, an element is popped from the head of the list and returned to the caller together with the name of the key (BLPOP returns a two elements array, the first element is the key, the second the popped value).
     *
     * Keys are scanned from left to right, so for instance if you issue BLPOP list1 list2 list3 0 against a dataset where list1 does not exist but list2 and list3 contain non empty lists, BLPOP guarantees to return an element from the list stored at list2 (since it is the first non empty list starting from the left).
     *
     * <b>Blocking behavior</b>
     *
     * If none of the specified keys exist or contain non empty lists, BLPOP blocks until some other client performs a LPUSH or an RPUSH operation against one of the lists.
     *
     * Once new data is present on one of the lists, the client finally returns with the name of the key unblocking it and the popped value.
     *
     * When blocking, if a non-zero timeout is specified, the client will unblock returning a nil special value if the specified amount of seconds passed without a push operation against at least one of the specified keys.
     *
     * The timeout argument is interpreted as an integer value. A timeout of zero means instead to block forever.
     *
     * <b>Multiple clients blocking for the same keys</b>
     *
     * Multiple clients can block for the same key. They are put into a queue, so the first to be served will be the one that started to wait earlier, in a first-blpopping first-served fashion.
     *
     * <b>blocking POP inside a MULTI/EXEC transaction</b>
     *
     * BLPOP and BRPOP can be used with pipelining (sending multiple commands and reading the replies in batch), but it does not make sense to use BLPOP or BRPOP inside a MULTI/EXEC block (a Redis transaction).
     *
     * The behavior of BLPOP inside MULTI/EXEC when the list is empty is to return a multi-bulk nil reply, exactly what happens when the timeout is reached. If you like science fiction, think at it like if inside MULTI/EXEC the time will flow at infinite speed :)
     *
     * Time complexity: O(1)
     *
     * @param {int} timeout amount of time to block, if non-zero
     * @param {string} keys names of keys for operation
     * @returns {array} name of key, popped value
     */
    blpop: function (timeout, keys) {
        return this.redis.blpop(arguments);
    },

    /**
     * See blpop above
     *
     * @param {int} timeout amount of time to block, if non-zero
     * @param {string} keys names of keys for operation
     * @returns {array} name of key, popped value
     */
    brpop: function (timeout, keys) {
        return this.redis.brpop(arguments);
    },

    /**
     * Request for authentication in a password protected Redis server.
     *
     * A Redis server can be instructed to require a password before to allow clients to issue commands. This is done using the requirepass directive in the Redis configuration file. If the password given by the client is correct the server replies with an OK status code reply and starts accepting commands from the client. Otherwise an error is returned and the clients needs to try a new password. Note that for the high performance nature of Redis it is possible to try a lot of passwords in parallel in very short time, so make sure to generate a strong and very long password so that this attack is infeasible.
     *
     * @param {string} password
     * @returns {string} status code reply
     */
    auth: function (password) {
        return this.redis.auth(password);
    },

    /////// publisher and subscriber methods not implemented

    /**
     * Returns the number of elements in the sorted set at key with a score between min and max.
     *
     * @param {string} key name of set
     * @param {number} min minimum score
     * @param {number} max maximum score
     * @returns {int} number of elements in the specified score range
     */
    zcount: function (key, min, max) {
        return this.redis.zcount(key, min, max);
    },

    /**
     * Returns all the elements in the sorted set at key with a score between min and max (including elements with score equal to min or max).
     *
     * The elements are considered to be ordered from low to high scores.
     *
     * The elements having the same score are returned in lexicographical order (this follows from a property of the sorted set implementation in Redis and does not involve further computation).
     *
     * The optional offset and count arguments can be used to only get a range of the matching elements (similar to SELECT LIMIT offset, count in SQL). Keep in mind that if offset is large, the sorted set needs to be traversed for offset elements before getting to the elements to return, which can add up to O(N) time complexity.
     *
     * <b>Exclusive intervals and infinity</b>
     *
     * min and max can be -inf and +inf, so that you are not required to know the highest or lowest score in the sorted set to get all elements from or up to a certain score.
     *
     * By default, the interval specified by min and max is closed (inclusive). It is possible to specify an open interval (exclusive) by prefixing the score with the character (. For example:
     *
     *      ZRANGEBYSCORE zset (1 5
     *
     * Will return all elements with 1 < score <= 5 while:
     *
     *      ZRANGEBYSCORE zset (5 (10
     *
     * Will return all the elements with 5 < score < 10 (5 and 10 excluded).
     *
     * Available since 1.0.5.
     *
     * Time complexity: O(log(N)+M) with N being the number of elements in the sorted set and M the number of elements being returned. If M is constant (e.g. always asking for the first 10 elements with LIMIT), you can consider it O(log(N)).
     *
     * @param {string} key set to get elements from
     * @param {string} min minimum score
     * @param {string} max maximum score
     * @param {int} offset
     * @param {int} count
     * @returns {array} elements within the range
     */
    zrangeByScore: function (key, min, max, offset, count) {
        return this.redis.zrangeByScore(arguments);
    },

    /**
     * Same as zrangeByScore except element/score pairs returned in the array.
     *
     * @param {string} key set to get elements from
     * @param {string} min minimum score
     * @param {string} max maximum score
     * @param {int} offset
     * @param {int} count
     * @returns {array} elements within the range
     */
    zrangeByScoreWithScores: function (key, min, max, offset, count) {
        return this.redis.zrangeByScoreWithScores(arguments);
    },

    /**
     * Returns all the elements in the sorted set at key with a score between max and min (including elements with score equal to max or min). In contrary to the default ordering of sorted sets, for this command the elements are considered to be ordered from high to low scores.
     *
     * The elements having the same score are returned in reverse lexicographical order.
     *
     * Apart from the reversed ordering, ZREVRANGEBYSCORE is similar to ZRANGEBYSCORE.
     *
     * Available since 2.2.0.
     *
     * Time complexity: O(log(N)+M) with N being the number of elements in the sorted set and M the number of elements being returned. If M is constant (e.g. always asking for the first 10 elements with LIMIT), you can consider it O(log(N)).
     *
     * @param {string} key set to get elements from
     * @param {string} min minimum score
     * @param {string} max maximum score
     * @param {int} offset
     * @param {int} count
     * @returns {array} elements within the range
     */
    zrevrangeByScore: function (key, min, max, offset, count) {
        return this.redis.zrevrangeByScore(arguments);
    },

    /**
     * Same as zrevrangeByScore except element/score pairs returned in the array
     *
     * @param {string} key set to get elements from
     * @param {string} min minimum score
     * @param {string} max maximum score
     * @param {int} offset
     * @param {int} count
     * @returns {array} elements within the range
     */
    zrevrangeByScoreWithScores: function (key, min, max, offset, count) {
        return this.redis.zrevrangeByScoreWithScores(arguments);
    },

    /**
     * Remove all elements in the sorted set at key with rank between start and end.
     *
     * Start and end are 0-based with rank 0 being the element with the lowest score.
     *
     * Both start and end can be negative numbers, where they indicate offsets starting at the element with the highest rank. For example: -1 is the element with the highest score, -2 the element with the second highest score and so forth.
     *
     * Time complexity: O(log(N))+O(M) with N being the number of elements in the sorted set and M the number of elements removed by the operation
     *
     * @param {string} key name of set
     * @param {int} start start index
     * @param {int} end end index
     * @returns {int} number of elements removed
     */
    zremrangeByRank: function (key, min, end) {
        return this.redis.zremrangeByRank(key, start, end);
    },

    /**
     * Remove all the elements in the sorted set at key with a score between min and max (including elements with score equal to min or max).
     *
     * Time complexity: O(log(N))+O(M) with N being the number of elements in the sorted set and M the number of elements removed by the operation
     *
     * @param {string} key name of set
     * @param {int} min minimum score
     * @param {int} max maximum score
     * @returns {int} number of elements removed
     */
    zremrangeByScore: function (key, min, max) {
        return this.redis.zremrangeByScore(key, min, max);
    },

    /**
     * Creates a union or intersection of N sorted sets given by keys k1 through kN, and stores it at dstKey.
     *
     * It is mandatory to provide the number of input keys N, before passing the input keys and the other (optional) arguments.
     *
     * As the terms imply, the ZINTERSTORE command requires an element to be present in each of the given inputs to be inserted in the result. The ZUNIONSTORE command inserts all elements across all inputs.
     *
     * Time complexity: O(N) + O(M log(M)) with N being the sum of the sizes of the input sorted sets, and M being the number of elements in the resulting sorted set
     *
     * @param {string} dstKey set to create
     * @param {...} sets sets to get union of
     * @returns {int} number of members of the result set
     */
    zunionstore: function (dstKey, sets) {
        return this.redis.zunionstore(arguments);
    },

    /**
     * Creates a union or intersection of N sorted sets given by keys k1 through kN, and stores it at dstKey.
     *
     * It is mandatory to provide the number of input keys N, before passing the input keys and the other (optional) arguments.
     *
     * As the terms imply, the ZINTERSTORE command requires an element to be present in each of the given inputs to be inserted in the result. The ZUNIONSTORE command inserts all elements across all inputs.
     *
     * Time complexity: O(N) + O(M log(M)) with N being the sum of the sizes of the input sorted sets, and M being the number of elements in the resulting sorted set
     *
     * @param {string} dstKey set to create
     * @param {...} sets sets to get intersection of
     * @returns {int} number of members of the result set
     */
    zinterstore: function (dstKey, sets) {
        return this.redis.zinterstore(arguments);
    },

    /**
     * Returns the length of the string value stored at key.
     *
     * An error is returned when key holds a non-string value.
     *
     * @param {string} key name of string to get length of
     * @returns {int} the length of the string at key, or 0 when key does not exist
     */
    strlen: function (key) {
        return this.redis.strlen(key);
    },

    /**
     * Inserts value at the head of the list stored at key, only if key already exists and holds a list.
     *
     * In contrary to LPUSH, no operation will be performed when key does not yet exist.
     *
     * Available since 2.2.0.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of list
     * @param {string} string value to push
     * @returns {int} length of the list after the push operation
     */
    lpushx: function (key, string) {
        return this.redis.lpushx(key);
    },

    /**
     * Undo a expire at turning the expire key into a normal key.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of key
     * @returns {int} 1: the key is now persist. 0: the key is not persist (only happens when key not set).
     */
    persist: function (key) {
        return this.redis.persist(key);
    },

    /**
     * Inserts value at the tail of the list stored at key, only if key already exists and holds a list.
     *
     * In contrary to RPUSH, no operation will be performed when key does not yet exist.
     *
     * Available since 2.2.0.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of list
     * @param {string} string value to push
     * @returns {int} length of the list after the push operation
     */
    rpushx: function (key, string) {
        return this.redis.rpushx(key, string);
    },

    /**
     * Echos the message argument
     *
     * @param {string} string message
     * @returns {string} the message
     */
    echo: function (string) {
        return this.redis.echo(string);
    },

    /**
     * Inserts value in the list stored at key either before or after the reference value pivot.
     *
     * When key does not exist, it is considered an empty list and no operation is performed.
     *
     * An error is returned when key exists but does not hold a list value.
     *
     * Available since 2.2.0.
     *
     * Time complexity: O(N) where N is the number of elements to traverse before seeing the value pivot. This means that inserting somewhere on the left end on the list (head) can be considered O(1) and inserting somewhere on the right end (tail) is O(N).
     *
     * @param {string} key name of list
     * @param {string} where either "before" or "after"
     * @param {string} pivot member in list to insert value before or after
     * @param {string} value value to insert
     * @returns {int} length of the list after the insert operation or -1 if pivot value not found
     */
    linsert: function (key, where, pivot, value) {
        return this.redis.linsert(key, where, pivot, value);
    },

    /**
     * BRPOPLPUSH is the blocking variant of RPOPLPUSH.
     *
     * When source contains elements, this command behaves exactly like RPOPLPUSH.
     *
     * When source is empty, Redis will block the connection until another client pushes to it or until timeout is reached.
     *
     * A timeout of zero can be used to block indefinitely.
     *
     * See RPOPLPUSH for more information.
     *
     * Available since 2.2.0.
     *
     * Time complexity: O(1)
     *
     * @param {string} source
     * @param {string} destination
     * @param {int} timeout
     * @returns {*}
     */
    brpoplpush: function (source, destination, timeout) {
        return this.redis.rpoplpush(source, destination, timeout);
    },

    /**
     * Sets or clears the bit at offset in the string value stored at key.
     *
     * The bit is either set or cleared depending on value, which can be either 0 or 1. When key does not exist, a new string value is created. The string is grown to make sure it can hold a bit at offset. The offset argument is required to be greater than or equal to 0, and smaller than 232 (this limits bitmaps to 512MB). When the string at key is grown, added bits are set to 0.
     *
     * <b>Warning:</b> When setting the last possible bit (offset equal to 232 -1) and the string value stored at key does not yet hold a string value, or holds a small string value, Redis needs to allocate all intermediate memory which can block the server for some time. On a 2010 MacBook Pro, setting bit number 232 -1 (512MB allocation) takes ~300ms, setting bit number 230 -1 (128MB allocation) takes ~80ms, setting bit number 228 -1 (32MB allocation) takes ~30ms and setting bit number 226 -1 (8MB allocation) takes ~8ms. Note that once this first allocation is done, subsequent calls to SETBIT for the same key will not have the allocation overhead.
     *
     * Available since 2.2.0.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of string
     * @param {int} offset offset in the string
     * @param {boolean} value true to set the bit, false to clear the bit
     * @returns {int} original bit value stored at offset
     */
    setbit: function (key, offset, value) {
        return this.redis.setbit(key, offset, value);
    },

    /**
     * Returns the bit value at offset in the string value stored at key.
     *
     * When offset is beyond the string length, the string is assumed to be a contiguous space with 0 bits. When key does not exist it is assumed to be an empty string, so offset is always out of range and the value is also assumed to be a contiguous space with 0 bits.
     *
     * Available since 2.2.0.
     *
     * Time complexity: O(1)
     *
     * @param {string} key name of string
     * @param {int} offset offset in the string
     * @returns {int} value of bit value stored at offset
     */
    getbit: function (key, offset, value) {
        return this.redis.getbit(key, offset, value);
    },

    /**
     * Overwrites part of the string stored at key, starting at the specified offset, for the entire length of value.
     *
     * If the offset is larger than the current length of the string at key, the string is padded with zero-bytes to make offset fit. Non-existing keys are considered as empty strings, so this command will make sure it holds a string large enough to be able to set value at offset.
     *
     * Note that the maximum offset that you can set is 229 -1 (536870911), as Redis Strings are limited to 512 megabytes. If you need to grow beyond this size, you can use multiple keys.
     *
     * Warning: When setting the last possible byte and the string value stored at key does not yet hold a string value, or holds a small string value, Redis needs to allocate all intermediate memory which can block the server for some time. On a 2010 MacBook Pro, setting byte number 536870911 (512MB allocation) takes ~300ms, setting byte number 134217728 (128MB allocation) takes ~80ms, setting bit number 33554432 (32MB allocation) takes ~30ms and setting bit number 8388608 (8MB allocation) takes ~8ms. Note that once this first allocation is done, subsequent calls to SETRANGE for the same key will not have the allocation overhead.
     *
     * <b>Patterns</b>
     * Thanks to SETRANGE and the analogous GETRANGE commands, you can use Redis strings as a linear array with O(1) random access. This is a very fast and efficient storage in many real world use cases.
     *
     * Available since 2.2.0.
     *
     * Time complexity: O(1), not counting the time taken to copy the new string in place. Usually, this string is very small so the amortized complexity is O(1). Otherwise, complexity is O(M) with M being the length of the value argument.
     *
     * @param {string} key name of string
     * @param {int} offset offset in string to overwrite
     * @param {string} value value to store in string at offset
     * @returns {int} length of string after operation
     */
    setrange: function (key, offset, value) {
        return this.redis.setrange(key, offset, value);
    },

    /**
     * Returns the substring of the string value stored at key, determined by the offsets start and end (both are inclusive).
     *
     * Negative offsets can be used in order to provide an offset starting from the end of the string. So -1 means the last character, -2 the penultimate and so forth.
     *
     * Warning: this command was renamed to GETRANGE, it is called SUBSTR in Redis versions <= 2.0.
     *
     * The function handles out of range requests by limiting the resulting range to the actual length of the string.
     *
     * Available since 2.4.0.
     *
     * Time complexity: O(N) where N is the length of the returned string. The complexity is ultimately determined by the returned length, but because creating a substring from an existing string is very cheap, it can be considered O(1) for small strings.
     *
     * @param {string} key name of string
     * @param {int} start start offset in string
     * @param {int} end end offset in string
     * @returns {string} the substring
     */
    getrange: function (key, start, end) {
        return this.redis.getrange(key, start, end);
    },

    /**
     * The CONFIG GET command is used to read the configuration parameters of a running Redis server.
     *
     * Not all the configuration parameters are supported in Redis 2.4, while Redis 2.6 can read the whole configuration of a server using this command.
     *
     * The symmetric command used to alter the configuration at run time is CONFIG SET.
     *
     * CONFIG GET takes a single argument, which is a glob-style pattern. All the configuration parameters matching this parameter are reported as a list of key-value pairs. Example:
     *
     *          redis> config get *max-*-entries*
     *          1) "hash-max-zipmap-entries"
     *          2) "512"
     *          3) "list-max-ziplist-entries"
     *          4) "512"
     *          5) "set-max-intset-entries"
     *          6) "512"
     *
     * You can obtain a list of all the supported configuration parameters by typing CONFIG GET * in an open redis-cli prompt.
     *
     * All the supported parameters have the same meaning of the equivalent configuration parameter used in the redis.conf file, with the following important differences:
     *
     * - Where bytes or other quantities are specified, it is not possible to use the redis.conf abbreviated form (10k 2gb ... and so forth), everything should be specified as a well-formed 64-bit integer, in the base unit of the configuration directive.
     * - The save parameter is a single string of space-separated integers. Every pair of integers represent a seconds/modifications threshold.
     *
     * For instance what in redis.conf looks like:
     *
     *      save 900 1
     *      save 300 10
     * that means, save after 900 seconds if there is at least 1 change to the dataset, and after 300 seconds if there are at least 10 changes to the datasets, will be reported by CONFIG GET as "900 1 300 10".
     *
     * Available since 2.0.0.
     *
     * @param {string} pattern glob style pattern
     * @returns {array} value of parameters
     */
    configGet: function (pattern) {
        return this.redis.configGet(pattern);
    },

    /**
     * The CONFIG SET command is used in order to reconfigure the server at run time without the need to restart Redis.
     *
     * You can change both trivial parameters or switch from one to another persistence option using this command.
     *
     * The list of configuration parameters supported by CONFIG SET can be obtained issuing a CONFIG GET * command, that is the symmetrical command used to obtain information about the configuration of a running Redis instance.
     *
     * All the configuration parameters set using CONFIG SET are immediately loaded by Redis and will take effect starting with the next command executed.
     *
     * All the supported parameters have the same meaning of the equivalent configuration parameter used in the redis.conf file, with the following important differences:
     *
     * Where bytes or other quantities are specified, it is not possible to use the redis.conf abbreviated form (10k 2gb ... and so forth), everything should be specified as a well-formed 64-bit integer, in the base unit of the configuration directive.
     *
     * The save parameter is a single string of space-separated integers. Every pair of integers represent a seconds/modifications threshold.
     *
     * For instance what in redis.conf looks like:
     *
     *      save 900 1
     *      save 300 10
     *
     * that means, save after 900 seconds if there is at least 1 change to the dataset, and after 300 seconds if there are at least 10 changes to the datasets, should be set using CONFIG SET as "900 1 300 10".
     *
     * It is possible to switch persistence from RDB snapshotting to append-only file (and the other way around) using the CONFIG SET command. For more information about how to do that please check the persistence page.
     *
     * In general what you should know is that setting the appendonly parameter to yes will start a background process to save the initial append-only file (obtained from the in memory data set), and will append all the subsequent commands on the append-only file, thus obtaining exactly the same effect of a Redis server that started with AOF turned on since the start.
     *
     * You can have both the AOF enabled with RDB snapshotting if you want, the two options are not mutually exclusive.
     *
     * Available since 2.0.0.
     *
     * @param {string} parameter name of parameter
     * @param {string} value value to set
     * @returns {string} OK if configuration was set properly, otherwise an error is returned.
     */
    configSet: function (parameter, value) {
        return this.redis.configSet(parameter, value);
    }

    // script stuff not implemented

//        /**
//         *
//         * Available since 2.2.12.
//
//         *
//         * @param {int} entries
//         * @returns {*}
//         */
//        slowlogGet: function(entries) {
//            return this.redis.slowlogGet(arguments);
//        },

//        /**
//         *
//         * @param {string} string
//         * @returns {*}
//         */
//        objectRefCount: function(string) {
//            return this.redis.objectRefCount(string);
//        },
//
//        /**
//         *
//         * @param {string} string
//         * @returns {*}
//         */
//        objectEncoding: function(string) {
//            return this.redis.objectEncodeing(string);
//        },
//
//        /**
//         *
//         * @param {string} string
//         * @returns {*}
//         */
//        objectIdleTime: function(string) {
//            return this.redis.objectIdleTime(string);
//        }

});

decaf.extend(exports, {
    Redis: Redis
});
