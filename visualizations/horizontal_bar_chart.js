import MultipleDatasetChart from './multiple_dataset_chart.js'

export default class Horizontal_bar_chart extends MultipleDatasetChart {
    constructor(parameters = { canvas: null, statistics_container: null }) {
        super(parameters)
    }

    _construct_chart_plugins() {
        return [ChartDataLabels]
    }

    _construct_chart_options() {
        return {
            plugins: {
                title: {
                    text: this.title,
                    display: true
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (item) => {
                            const { datasetIndex } = item[0]
                            const { dataIndex } = item[0]
                            const data_object = this._data[dataIndex].value[datasetIndex]
                            return data_object.name
                        },
                        label: (item) => {
                            const data_object = this._data[item.dataIndex].value[item.datasetIndex]
                            return data_object.submissions
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                y: {
                    stacked: false
                },
                x: {
                    stacked: false,
                    display: true,
                    barThickness: 1000
                }
            }
        }
    }

    _construct_chart_datasets() {
        const datasets = []
        let dispayed_number = 0
        const max_displayed = 5

        this.data.forEach((sprint_dataset) => {
            sprint_dataset.value.length > dispayed_number
                ? (dispayed_number = sprint_dataset.value.length)
                : null
        })

        if (dispayed_number > max_displayed) {
            dispayed_number = max_displayed
        }

        for (let i = 0; i < dispayed_number; i++) {
            const dataset = {
                type: 'bar',
                borderWidth: 2,
                datalabels: {
                    labels: {
                        title: null
                    }
                }
            }
            dataset.label = `${this.data_title} Place ${i + 1}`

            dataset.data = this.data.map((element) => {
                if (element.value[i]) {
                    return element.value[i].submissions
                }
            })

            const color_base =
                `rgba(0,` +
                `${(255 / dispayed_number) * (dispayed_number - i)},` +
                `${(255 / dispayed_number) * i},`

            dataset.type = 'bar'
            dataset.borderColor = `${color_base}1)`
            dataset.backgroundColor = `${color_base}0.25)`
            dataset.hoverBackgroundColor = `${color_base}1)`

            datasets.push(dataset)
        }
        return datasets
    }
}
