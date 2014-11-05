require 'sugar'

Object.map = (input, filter) ->
  output = {}
  for key, value of input
    output[key] = filter(key, value)
  output

Object.mapKeys = (input, filter) ->
  output = {}
  for key, value of input
    output[filter(key, value)] = value
  output

Object.zip = (keys, values) ->
  output = {}
  for i in [0...keys.length]
    output[keys[i]] = values[i]
  output