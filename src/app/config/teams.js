import _ from 'lodash'
import ravens from 'images/teams/ravens.png'
import cardinals from 'images/teams/cardinals.png'

const teams = {
  "arz": "Arizona Cardinals",
  "atl": "Atlanta Falcons",
  "bal": "Baltimore Ravens",
  "buf": "Buffalo Bills",
  "car": "Carolina Panthers",
  "chi": "Chicago Bears",
  "cin": "Cincinnati Bengals",
  "cle": "Cleveland Browns",
  "dal": "Dallas Cowboys",
  "den": "Denver Broncos",
  "det": "Detroit Lions",
  "gb": "Green Bay Packers",
  "hou": "Houston Texans",
  "ind": "Indianapolis Colts",
  "jac": "Jacksonville Jaguars",
  "kc": "Kansas City Chiefs",
  "mia": "Miami Dolphins",
  "min": "Minnesota Vikings",
  "ne": "New England Patriots",
  "no": "New Orleans Saints",
  "nyg": "New York Giants",
  "nyj": "New York Jets",
  "oak": "Oakland Raiders",
  "phi": "Philadelphia Eagles",
  "pit": "Pittsburgh Steelers",
  "stl": "St. Louis Rams",
  "sd": "San Diego Chargers",
  "sf": "San Francisco 49ers",
  "sea": "Seattle Seahawks",
  "tb": "Tampa Bay Buccaneers",
  "ten": "Tennessee Titans",
  "was": "Washington Redskins"
}

const list = _.reduce(teams, (result, teamName, teamId) => {
  result.push({id: teamId, name: teamName})
  return result
}, [])

const images = {
  "arz": cardinals,
  "atl": "Atlanta Falcons",
  "bal": ravens,
  "buf": "Buffalo Bills",
  "car": "Carolina Panthers",
  "chi": "Chicago Bears",
  "cin": "Cincinnati Bengals",
  "cle": "Cleveland Browns",
  "dal": "Dallas Cowboys",
  "den": "Denver Broncos",
  "det": "Detroit Lions",
  "gb": "Green Bay Packers",
  "hou": "Houston Texans",
  "ind": "Indianapolis Colts",
  "jac": "Jacksonville Jaguars",
  "kc": "Kansas City Chiefs",
  "mia": "Miami Dolphins",
  "min": "Minnesota Vikings",
  "ne": "New England Patriots",
  "no": "New Orleans Saints",
  "nyg": "New York Giants",
  "nyj": "New York Jets",
  "oak": "Oakland Raiders",
  "phi": "Philadelphia Eagles",
  "pit": "Pittsburgh Steelers",
  "stl": "St. Louis Rams",
  "sd": "San Diego Chargers",
  "sf": "San Francisco 49ers",
  "sea": "Seattle Seahawks",
  "tb": "Tampa Bay Buccaneers",
  "ten": "Tennessee Titans",
  "was": "Washington Redskins"
}

export default {
  map: teams,
  list,
  images
}
