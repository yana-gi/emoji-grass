#! /usr/bin/env node

const fetch = require('node-fetch')
const program = require('commander')
const graphemesplit = require('graphemesplit')

async function fetchContributions (userName) {
  const response = await fetch(`https://github.com/users/${userName}/contributions`)
  const text = await response.text()
  return text
}

function parseContributions (text) {
  const contributionRows = text.toString().match(/.*data-count=.*data-date=.*/g)

  return contributionRows.map(contributionRow => {
    const regexp = /.*data-count="(?<data_count>.*)".*data-date="(?<data_date>.*)" data-level=.*/g
    const data = regexp.exec(contributionRow)
    return {
      data_date: data.groups.data_date,
      data_count: data.groups.data_count
    }
  })
}

function showGrass (contributions, character) {
  const Grasses = contributions.map(contribution => { return contribution.data_count > 0 ? character : '  ' })

  const cnt = 7
  const allWeekGrasses = []
  for (let i = 0; i < Math.ceil(Grasses.length / cnt); i++) {
    const j = i * cnt
    const WeekGrasses = Grasses.slice(j, j + cnt)
    allWeekGrasses.push(WeekGrasses)
  }

  const transpose = a => a[0].map((_, c) => a.map(r => r[c]))
  transpose(allWeekGrasses).forEach(WeekGrasses => console.log(WeekGrasses.join('')))
}

function main () {
  program
    .name('github-emoji-grass')
    .requiredOption('-u, --username [username]', 'Specify your username of GitHub account.')
    .option('-c, --character [character]', 'Specify a single character to display.', '🌱')
    .parse()

  const options = program.opts()

  if (graphemesplit(options.character).length !== 1) {
    console.log('Character must be a single')
    return
  }

  fetchContributions(options.username)
    .then(text => {
      const contributions = parseContributions(text)
      showGrass(contributions, options.character)
    })
    .catch(() => {
      console.log('An error has occurred.')
    })
}

main()
