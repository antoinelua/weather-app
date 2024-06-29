import { useState, useMemo } from 'react'
import axios from 'axios'
import { z } from 'zod'
//import { object, string, number, Output, parse } from 'valibot'
import { SearchType } from '../types'

// zod
const Weather = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        temp_max: z.number(),
        temp_min: z.number()
    })

})
export type Weather = z.infer<typeof Weather>


// Valibot
/*const WeatherSchema = object({
    name: string(),
    main: object({
        temp: number(),
        temp_max: number(),
        temp_min: number()
    })
})
type Weather = Output<typeof WeatherSchema>*/

const initialState = {
    name: '',
    main: {
        temp: 0,
        temp_max: 0,
        temp_min: 0
    }
}

export default function useWeather() {

    const [weather, setWeather] = useState<Weather>(initialState)
    const [loading, setLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)

    const fetchWeather = async (search: SearchType) => {

        // Resguardando nuesta API KEY
        const appId = import.meta.env.VITE_API_KEY
        setLoading(true)
        setWeather(initialState) // Se reinicia cada que se ejecuta pra evitar que haya dos commponentes al mismo tiempo
        try {
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`

            const { data } = await axios(geoUrl, { method: 'get' }) //get es el default, pero lo estamos especificando

            // Comprobar si existe
            if (!data[0]) {
                setNotFound(true)
                return
            }

            const lat = data[0].lat
            const lon = data[0].lon

            // TYPE GUARD
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`
            // const { data: weatherResult } = await axios(weatherUrl)
            // const result = isWeatherResponse(weatherResult)
            /*if (result) {
                console.log(weatherResult.name)
            }*/

            // Zod
            const { data: weatherResult } = await axios(weatherUrl)
            const result = Weather.safeParse(weatherResult)
            if (result.success) {
                setWeather(result.data)
            } else {
                console.log('Wrong answer...')
            }

            // Valibot
            /*const { data: weatherResult } = await axios(weatherUrl)
            const result = parse(WeatherSchema, weatherResult)
            if (result) {
                console.log(result)
            } else {
                console.log('respuesta mal formada...')
            }*/

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const hasWeatherDate = useMemo(() => weather.name, [weather])

    return {
        weather,
        loading,
        notFound,
        fetchWeather,
        hasWeatherDate
    }
}
