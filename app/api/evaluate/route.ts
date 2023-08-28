import { auth } from '@/auth'
import { inngest } from '@/lib/inngest'
import { FunctionEvent, StartEvaluationRequest } from '@/lib/inngest/functions'

export const runtime = 'edge'

export async function POST(req: Request) {
  const json = await req.json()
  const { messages } = json
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const data: StartEvaluationRequest = {
    userId,
    task: messages,
    rubric: {
      aggregation: 'geometric-mean',
      criteria: [
        {
          name: 'Completion',
          description:
            'How well does the response complete the requested task?',
          weight: 5
        },
        {
          name: 'Accuracy',
          description:
            'How accurate is the response? Does it contain any factual innaccuracies?',
          weight: 3
        },
        {
          name: 'Authenticity',
          description:
            'How authentic does this response sound? Does it sound like something a real person would say?',
          weight: 3
        }
      ]
    },
    models: [
      { model: 'gpt-3.5-turbo', temperature: 0.9 },
      { model: 'gpt-4', temperature: 0.7 }
    ]
  }

  await inngest.send({ name: FunctionEvent.StartEvaluation, data })
}
