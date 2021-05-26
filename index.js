#! /usr/bin/env node

const fs = require('fs').promises
const { graphql } = require('@octokit/graphql')
const dotenv = require('dotenv')
const program = require('commander')
const graphemesplit = require('graphemesplit')

const fetchContribution = async ({ userName }) => {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`
    }
  })

  const query =
    `query getContribution($userName:String!) {
      user(login: $userName) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }`
  return await graphqlWithAuth(query, { userName: userName })
}

function showGrass (contributionWeeks, character) {
  const grassWeeks = []

  contributionWeeks.forEach((week, index) => {
    grassWeeks[index] =
      week.contributionDays.map(contribution => { return contribution.contributionCount > 0 ? character : '  ' })
  })

  const transpose = a => a[0].map((_, c) => a.map(r => r[c]))
  transpose(grassWeeks).forEach(week => console.log(week.join('')))
}

async function main () {
  program
    .name('emoji-grass')

  program
    .command('display', { isDefault: true })
    .arguments('<username>')
    .description('Display the grass of GitHub by emoji')
    .option('-c, --character [character]', 'Specify a single character to display', '🌱')
    .action(async (username, options) => {
      try {
        dotenv.config()
        if (process.env.GITHUB_TOKEN === undefined) {
          console.log('You need to set up personal access token of GitHub')
          return
        }

        if (graphemesplit(options.character).length !== 1) {
          console.log('Character must be a single')
          return
        }
        const response = await fetchContribution({ userName: username })
        const contributionWeeks = response.user.contributionsCollection.contributionCalendar.weeks
        await showGrass(contributionWeeks, options.character)
      } catch (err) {
        console.log(err.message)
      }
    })

  program
    .command('settoken')
    .arguments('<token>')
    .description('Set up the personal access token of GitHub\n' +
      'Generate a token in https://github.com/settings/tokens')
    .action(async (token) => {
      try {
        await fs.writeFile('~/.grass_env', `GITHUB_TOKEN = ${token}`)
        await dotenv.config()
        await console.log('Set up personal access token of GitHub')
      } catch (err) {
        console.log(err.message)
      }
    })

  program.parse()
}

main()
