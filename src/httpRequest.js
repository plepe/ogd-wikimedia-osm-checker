/**
 * @param {string} url - The URL of the request
 * @param {Object} options - Options
 * @param {string} options.method=GET - Method of the request (e.g. POST, DELETE).
 * @param {string} options.body=null - Body of the request.
 * @param {Object} options.headers - Additional request headers
 * @param {boolean} options.enableServerLoad=false - Try to pass the request via the httpRequest.php server script to avoid CORS problems (when direct request does not work)
 * @param {boolean} options.forceServerLoad=false - Pass the request via the httpRequest.php server script to avoid CORS problems.
 * @param {string} options.responseType=text - a string defining the XMLHttpRequestResponseType
 * @param {function} callback - Callback which will be called when the request completes
 * @param {Error} callback.err - If an error occured, the error. Otherwise null.
 * @param {Object} callback.result - The result.
 * @param {string} callback.result.body - The result body.
 */
function httpRequest (url, options, callback, redirects = []) {
  let corsRetry = true
  var xhr

  function readyStateChange () {
    if (xhr.readyState === 4) {
      if (corsRetry && xhr.status === 0) {
        corsRetry = false
        if (options.enableServerLoad) {
          return viaServer()
        }
      }

      if (xhr.status === 200) {
        xhr.body = xhr.response

        if (options.responseType === 'json') {
          try {
            xhr.body = JSON.parse(xhr.response)
          } catch (e) {
            return callback(new Error('Error parsing JSON result: ' + e.message), xhr)
          }
        }

        callback(null, xhr)
      } else if (xhr.status === 302) {
        const redirectUrl = xhr.getResponseHeader('location')
        if (redirects.includes(redirectUrl)) {
          return callback(new Error('Page keeps redirecting: ' + redirectUrl))
        }

        httpRequest(redirectUrl, options, callback, redirects.concat(redirectUrl))
      } else {
        callback(new Error(xhr.statusText), xhr)
      }
    }
  }

  function parseResponseType () {
    if (!('responseType' in options)) {
      return 'text'
    }

    if (options.responseType === 'json') {
      return 'text'
    }

    return options.responseType
  }

  function direct () {
    xhr = new global.XMLHttpRequest()
    xhr.open(options.method || 'GET', url, true)

    if (options.headers) {
      for (const k in options.headers) {
        xhr.setRequestHeader(k, options.headers[k])
      }
    }

    xhr.responseType = parseResponseType()
    xhr.onreadystatechange = readyStateChange
    xhr.send(options.body)
  }

  function viaServer () {
    xhr = new global.XMLHttpRequest()
    xhr.open(options.method || 'GET', 'httpRequest.php?url=' + encodeURIComponent(url), true)
    xhr.responseType = parseResponseType()
    xhr.onreadystatechange = readyStateChange
    xhr.send(options.body)
  }

  if (options.forceServerLoad) {
    viaServer()
  } else {
    direct()
  }
}

module.exports = httpRequest
