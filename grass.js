const request = require('sync-request')
const grassUrl = 'https://github.com/users/yana-gi/contributions'

const getGrass = url => {
    const response = request('GET', url)
    const grassElement = response.body.toString().match(/.*<rect width="11.*><\/rect>.*/g)
    return grassElement.map(x => {
        return {
            data_date: x.trimStart().split(' ')[9].slice(11, 21),
            data_count: Number(x.trimStart().split(' ')[8].split('"').join('').slice(11))
        }
    }).reverse()
}
console.log(getGrass(grassUrl))
