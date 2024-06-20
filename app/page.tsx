import prisma from "@/lib/prisma";
import Buttons from "./buttons";
import { deleteUser, duplicateUser } from "./actions";

const Home = async () => {
  const users = await prisma.user.findMany();
  const logs = await prisma.log.findMany();

  return (
    <main>
      <Buttons />

      <h1>Users</h1>

      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <form action={deleteUser.bind(null, user.id)}>
                  <button type="submit">Delete</button>
                </form>

                <form action={duplicateUser.bind(null, user.id)}>
                  <button type="submit">Duplicate</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h1>Logs</h1>

      <ul>
        {logs.map((log) => (
          <li key={log.id}>{log.message}</li>
        ))}
      </ul>
    </main>
  );
};

export default Home;
