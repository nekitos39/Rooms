import Fastify, { type FastifyError } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import { STATUS_CODES } from 'node:http'
import prismaPlugin from './plugins/prisma.js'
import { Type as T } from 'typebox'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { ValidationProblem, ProblemDetails, User, Health } from './types.js'

export async function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true, 
  
    schemaErrorFormatter(errors, dataVar) {
      const msg = errors.map((e) => e.message).filter(Boolean).join('; ') || 'Validation failed'
      return new ValidationProblem(msg, errors, dataVar)
    }
  }).withTypeProvider<TypeBoxTypeProvider>() 


  await app.register(helmet)

await app.register(cors, {
  origin: [
  'https://nekitos39.github.io',
  /^http:\/\/localhost(:\d+)?$/,
],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],});

  await app.register(rateLimit, {
    max: 100, 
    timeWindow: '1 minute', 
    enableDraftSpec: true, 
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true
    },
    errorResponseBuilder(request, ctx) {
      const seconds = Math.ceil(ctx.ttl / 1000)
      return {
        type: 'about:blank',
        title: 'Too Many Requests',
        status: 429,
        detail: `Rate limit exceeded. Retry in ${seconds} seconds.`,
        instance: request.url
      } satisfies ProblemDetails
    }
  })

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Rooms API',
        version: '1.0.0',
        description: 'HTTP-API, совместим с RFC 9457.'
      },
      servers: [{ url: 'http://localhost:3000' }],
      tags: [
        { name: 'Users', description: 'Маршруты для управления пользователями' },
        { name: 'System', description: 'Служебные эндпоинты' }
      ]
    }
  })

  await app.register(prismaPlugin)

  app.setErrorHandler<FastifyError | ValidationProblem>((err, req, reply) => {
    const status = typeof err.statusCode === 'number' ? err.statusCode : 500
    const isValidation = err instanceof ValidationProblem

    const problem = {
      type: 'about:blank',
      title: STATUS_CODES[status] ?? 'Error',
      status,
      detail: err.message || 'Unexpected error',
      instance: req.url,
      ...(isValidation ? { errorsText: err.message } : {})
    }

    reply.code(status).type('application/problem+json').send(problem)
  })

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).type('application/problem+json').send({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: `Route ${request.method} ${request.url} not found`,
      instance: request.url
    } satisfies ProblemDetails)
  })

app.get(
  '/api/rooms',
  {
    schema: {
      operationId: 'listRooms',
      tags: ['Rooms'],
      summary: 'Возвращает список аудиторий',
      response: {
        200: {
          description: 'Список аудиторий',
          
        }
      }
    }
  },
  async (_req, _reply) => {
    return app.prisma.room.findMany();
  }
);

app.post(
  '/api/rooms',
  {
    schema: {
      operationId: 'createRoom',
      tags: ['Rooms'],
      summary: 'Создает новую аудиторию',
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          number: { type: 'string' },
          capacity: { type: 'integer' },
          features: { type: 'array', items: { type: 'string' } }
        },
        required: ['name', 'number', 'capacity']
      }
    }
  },
  async (request, reply) => {
    const { name, number, capacity, features } = request.body as any;
    const newRoom = await app.prisma.room.create({
      data: {
        name,
        number,
        capacity,
        features: features || [],
      },
    });
    reply.code(201).send(newRoom);
  }
);

app.post(
  '/api/bookings',
  {
    schema: {
      operationId: 'createBooking',
      tags: ['Bookings'],
      summary: 'Создает новую бронь',
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          roomId: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
          userId: { type: 'string' }
        },
        required: ['title', 'roomId', 'startTime', 'endTime', 'userId']
      }
    }
  },
  async (request, reply) => {
    const { title, roomId, startTime, endTime, notes, userId } = request.body as any;

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    const conflictingBookings = await app.prisma.booking.findMany({
      where: {
        roomId,
        startTime: { lt: newEndTime },
        endTime: { gt: newStartTime },
      },
    });

    if (conflictingBookings.length > 0) {
      reply.code(409).send({
        message: 'Время занято. Выберите другой временной интервал.',
        conflicts: conflictingBookings.map(b => ({
          id: b.id,
          title: b.title,
          startTime: b.startTime,
          endTime: b.endTime,
        })),
      });
      return; 
    }

    try {
      const newBooking = await app.prisma.booking.create({
        data: {
          title,
          roomId,
          startTime: newStartTime,
          endTime: newEndTime,
          notes,
          userId,
        },
      });

      await app.prisma.room.update({
        where: { id: roomId },
        data: { status: 'booked' },
      });

      reply.code(201).send(newBooking);

    } catch (error) {
      console.error("Ошибка при создании брони:", error);
      reply.code(500).send({ message: "Не удалось создать бронь." });
    }
  }
);

  app.get(
    '/api/users',
    {
      schema: {
        operationId: 'listUsers',
        tags: ['Users'],
        summary: 'Возвращает список пользователей',
        description: 'Получаем id и email для каждого пользователя.',
        response: {
          200: {
            description: 'Список пользователей',
            content: { 'application/json': { schema: T.Array(User) } }
          },
          429: {
            description: 'Too Many Requests',
            headers: {
              'retry-after': {
                schema: T.Integer({ minimum: 0, description: 'Через сколько секунд можно повторить запрос' })
              }
            },
            content: { 'application/problem+json': { schema: ProblemDetails } }
          },
          500: {
            description: 'Internal Server Error',
            content: { 'application/problem+json': { schema: ProblemDetails } }
          }
        }
      }
    },
    async (_req, _reply) => {
      // Prisma автоматически превращает результат в Promise; Fastify вернет массив как JSON.
      return app.prisma.user.findMany({ select: { id: true, email: true } })
    }
  )

  app.get(
    '/api/health',
    {
      schema: {
        operationId: 'health',
        tags: ['System'],
        summary: 'Health/Readiness',
        description: 'Проверяет, что процесс жив и база данных отвечает.',
        response: {
          200: {
            description: 'Ready',
            content: { 'application/json': { schema: Health } }
          },
          503: {
            description: 'Temporarily unavailable',
            content: { 'application/problem+json': { schema: ProblemDetails } }
          },
          429: {
            description: 'Too Many Requests',
            headers: {
              'retry-after': { schema: T.Integer({ minimum: 0 }) }
            },
            content: { 'application/problem+json': { schema: ProblemDetails } }
          },
          500: {
            description: 'Internal Server Error',
            content: { 'application/problem+json': { schema: ProblemDetails } }
          }
        }
      }
    },
    async (_req, reply) => {
      try {
        await app.prisma.$queryRaw`SELECT 1`
        return { ok: true } as Health
      } catch {
        reply.code(503).type('application/problem+json').send({
          type: 'https://example.com/problems/dependency-unavailable',
          title: 'Service Unavailable',
          status: 503,
          detail: 'Database ping failed',
          instance: '/api/health'
        } satisfies ProblemDetails)
      }
    }
  )

  app.get(
    '/openapi.json',
    {
      schema: { hide: true, tags: ['Internal'] } 
    },
    async (_req, reply) => {
      reply.type('application/json').send(app.swagger())
    }
  )

app.get(
  '/api/bookings',
  {
    schema: {
      operationId: 'listBookings',
      tags: ['Bookings'],
      summary: 'Возвращает список всех бронирований',
      response: {
        200: {
          description: 'Список бронирований',
        }
      }
    }
  },
  async (_req, _reply) => {
    const bookings = await app.prisma.booking.findMany({
      include: {
        room: true,
        user: {
          select: { id: true, email: true } 
        }
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    const bookingsDto = bookings.map(booking => ({
      id: booking.id,
      title: booking.title,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      notes: booking.notes,
      room: {
        id: booking.room.id,
        name: booking.room.name,
        number: booking.room.number,
      },
      user: {
        id: booking.user.id,
        email: booking.user.email,
      }
    }));

    return bookingsDto;
  }
);

/**
 * DELETE /api/bookings/:id — удаляет бронь.
 */
app.delete(
  '/api/bookings/:id',
  {
    schema: {
      operationId: 'deleteBooking',
      tags: ['Bookings'],
      summary: 'Удаляет существующую бронь',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  },
  async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await app.prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUniqueOrThrow({
          where: { id },
        });

        await tx.booking.delete({
          where: { id },
        });

        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: 'available' },
        });
      });

      reply.code(204).send();

    } catch (error) {
      console.error("Ошибка при удалении брони:", error);
      reply.code(404).send({ message: "Бронь не найдена." });
    }
  }
);

/**
 * PATCH /api/bookings/:id — обновляет существующую бронь.
 */
app.patch(
  '/api/bookings/:id',
  {
    schema: {
      operationId: 'updateBooking',
      tags: ['Bookings'],
      summary: 'Обновляет существующую бронь',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
        },
      }
    }
  },
  async (request, reply) => {
    const { id } = request.params as { id: string };
    const { title, startTime, endTime } = request.body as any;

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    try {
      const existingBooking = await app.prisma.booking.findUnique({
        where: { id },
        select: { roomId: true } 
      });

      if (!existingBooking) {
        return reply.code(404).send({ message: "Бронь не найдена." });
      }

      const conflictingBookings = await app.prisma.booking.findMany({
        where: {
          roomId: existingBooking.roomId,
          id: { not: id }, 
          startTime: { lt: newEndTime },
          endTime: { gt: newStartTime },
        },
      });

      if (conflictingBookings.length > 0) {
        reply.code(409).send({
          message: 'Время занято. Выберите другой временной интервал.',
          conflicts: conflictingBookings.map(b => ({
            id: b.id,
            title: b.title,
            startTime: b.startTime,
            endTime: b.endTime,
          })),
        });
        return; 
      }

      const updatedBooking = await app.prisma.booking.update({
        where: { id },
        data: {
          title,
          startTime: newStartTime,
          endTime: newEndTime,
        },
      });
      reply.code(200).send(updatedBooking);

    } catch (error) {
      console.error("Ошибка при обновлении брони:", error);
      reply.code(404).send({ message: "Бронь не найдена." });
    }
  }
);

  return app
}
