import React, { Component } from 'react'

type Props = {
  text: string
}


type State = {}

class Question extends Component<Props, State> {
  state = {}

  render() {
    return (
      <div className="bg-gray-800 border border-red-900/30 rounded-lg p-6 mb-6 shadow-lg hover:shadow-red-900/20 transition-all duration-300">
        <h3 className="text-xl font-semibold text-red-100 mb-4 leading-relaxed">
        {this.props.text}
        </h3>
         <div className="space-y-3">
          <div className="flex space-x-2">
            {['Never', 'No desire', 'Maybe', 'Yes', 'Need'].map((answer: string) => (
              <button key={answer}>{answer}</button>
            ))}
          </div>

         </div>
        
      </div>
    )
  }
}

export default Question