let fs = require('fs')

// global variables
let map = []
let savedSlopes = {}
let startingElevation
let start = new Date()

// helper functions
let defined = (data) => {
  return typeof data !== 'undefined'
}

let rideSlope = (currentX, currentY, slopeLength, currentElevation) => {
  // console.log('Coordinates: ', currentX, currentY)
  // console.log('next elevation reached: ', map[currentY][currentX])
  slopeLength += 1 // means we have moved to a new part of the slope!
  /*
    directions 1 = up
    directions 1 = right
    directions 1 = down
    directions 1 = left
  */
  let directions = [1, 2, 3, 4]
  let nextXPos
  let nextYPos
  let validMovement = 0

  for (var i = 0; i < directions.length; i++) {
    if (directions[i] === 1) {
      // moving up
      nextXPos = currentX
      nextYPos = currentY - 1
    } else if (directions[i] === 2) {
      // moving right
      nextXPos = currentX + 1
      nextYPos = currentY
    } else if (directions[i] === 3) {
      // moving down
      nextXPos = currentX
      nextYPos = currentY + 1
    } else if (directions[i] === 4) {
      // moving left
      nextXPos = currentX - 1
      nextYPos = currentY
    }
    // console.log('checking next elevation..')
    let nextElevation = getElevation(nextXPos, nextYPos)
    if (nextElevation !== false) {
      // console.log('Elevation invalid..')
      // this direction is going to move off the map
      if (nextElevation < currentElevation) {
        // console.log('Elevation valid! Proceed to movement!')
        validMovement++
        /*
          elevation of the next movement is lower than the current
          add counter to validated slope movement
          recursively move to the next coordinate and run again
        */
        // console.log('proceeding to ride slope..')
        rideSlope(nextXPos, nextYPos, slopeLength, nextElevation)
      }
    }
  }
  if (!validMovement) {
    // console.log('Ride ended.. proceeding to record.')
    // if false means we have checked all possible directions to move to
    // end of slope check
    savedSlopes[slopeLength] = savedSlopes[slopeLength] || []
    savedSlopes[slopeLength].push({
      start: startingElevation,
      end: currentElevation,
      drop: startingElevation - currentElevation
    })
  }
}

let getElevation = (x, y) => {
  if (defined(map[y])) {
    if (defined(map[y][x])) {
      // console.log('Next elevation dispatched: ', map[y][x])
      return map[y][x]
    }
  }

  return false
}

// reading map
fs.readFile('map.txt', 'utf8', (err, data) => {
  if (err) return console.log(err)

  // get width and height of board
  let lines = data.trim().split('\n')
  let dimensions = lines.shift().split(' ')

  let width = dimensions[0]
  let height = dimensions[1]

  /*
  console.log(lines)
  console.log(dimensions)
  console.log(width)
  console.log(height)
  */

  // map into array map
  map = lines.reduce((all, cur, ind) => {
    let arr = cur.split(' ').map((ele) => {
      // parsing string into numbers
      return parseInt(ele)
    })
    all.push(arr)
    return all
  }, [])

  // console.log(map)

  // riding the slope map
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // each elevation of a straight column down (i.e in test case: 4, 2, 6, 4)
      startingElevation = getElevation(x, y)
      rideSlope(x, y, 0, startingElevation)
    }
  }
  // all slopes taken saved in savedSlopes
  // sorting best slope length with reverse
  let bestSlopeLength = parseInt(Object.keys(savedSlopes).reverse()[0])
  let bestSlopes = savedSlopes[bestSlopeLength]
  // finding the biggest drop in all the best lengths!
  let largestDrop = bestSlopes.reduce((prev, cur) => {
    return prev['drop'] > cur['drop'] ? prev['drop'] : cur['drop']
  })

  console.log(`The best slope has a length of ${bestSlopeLength} and the drop of ${largestDrop}`)
  console.log(`email to send to is: ${bestSlopeLength}${largestDrop}@redmart.com`)

  let end = new Date()
  let timeTaken = end - start
  console.log('Time taken: ', timeTaken / 1000, ' seconds')
})

/*
  params: Number, currentX => The x-coordinate to move to
  params: Number, currentY => The y-coordinate to move to
  params: Number, slopeLength => The length of slope currently being tracked
  params: Number, currentElevation => The elevation of my current position
*/
