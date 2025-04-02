import express, { Request, Response} from 'express';

const app = express();
const port = 8085;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send({ message: 'Hello World!'});
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
