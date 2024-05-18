import { type INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(helmet());
  app.enableCors();

  await app.listen(process.env.PORT as string, () => {
    console.log(
      `Server is listening on http://localhost:${process.env.PORT as string}`,
    );
  });
}

void bootstrap();
