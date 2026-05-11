import { z } from 'zod'
import { router, publicProcedure } from './trpc.js'
import { validateCredentials, listUsers, addUser, removeUser, changePassword } from './users.js'
import { fetchSalesData, fetchTriageData } from './sheets.js'

export const appRouter = router({
  dashboardUsers: router({
    validateCredentials: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input }) => {
        return validateCredentials(input.email, input.password)
      }),

    list: publicProcedure.query(() => {
      return listUsers()
    }),

    add: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          isAdmin: z.number().int().min(0).max(1).default(0),
        })
      )
      .mutation(async ({ input }) => {
        return addUser(input.email, input.password, input.isAdmin)
      }),

    remove: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(({ input }) => {
        return removeUser(input.id)
      }),

    changePassword: publicProcedure
      .input(z.object({ id: z.number().int(), newPassword: z.string().min(6) }))
      .mutation(async ({ input }) => {
        return changePassword(input.id, input.newPassword)
      }),
  }),
})

export type AppRouter = typeof appRouter
