using System;
using System.Diagnostics;
using System.IO.Pipes;
using System.Text;
using System.Threading.Tasks;

namespace JarvisNativeService
{
    /// <summary>
    /// J.A.R.V.I.S. C# Daemon de Control de Hardware, Procesos y Sistema Operativo Windows
    /// Se comunica con el backend de Python a través de Named Pipes de ultra-baja latencia (<1ms).
    /// </summary>
    class Program
    {
        private const string PipeName = "JarvisSystemControlPipe";

        static async Task Main(string[] args)
        {
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine("=================================================");
            Console.WriteLine(" J.A.R.V.I.S. C# NATIVE SYSTEM DAEMON INICIADO");
            Console.WriteLine("=================================================");
            Console.ResetColor();

            while (true)
            {
                try
                {
                    using (var server = new NamedPipeServerStream(PipeName, PipeDirection.InOut))
                    {
                        Console.WriteLine($"[C# DAEMON] Escuchando conexiones en pipe: {PipeName}...");
                        await server.WaitForConnectionAsync();

                        byte[] buffer = new byte[1024];
                        int bytesRead = await server.ReadAsync(buffer, 0, buffer.Length);
                        string command = Encoding.UTF8.GetString(buffer, 0, bytesRead).Trim();

                        Console.WriteLine($"[C# DAEMON] Comando recibido: '{command}'");

                        string response = ExecuteSystemAction(command);
                        byte[] responseBytes = Encoding.UTF8.GetBytes(response);
                        await server.WriteAsync(responseBytes, 0, responseBytes.Length);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[C# DAEMON ERROR]: {ex.Message}");
                    await Task.Delay(1000);
                }
            }
        }

        private static string ExecuteSystemAction(string command)
        {
            switch (command.ToLower())
            {
                case "ping":
                    return "PONG_OK";
                case "status":
                    var ramCounter = new PerformanceCounter("Memory", "Available MBytes");
                    return $"RAM disponible: {ramCounter.NextValue()} MB";
                default:
                    return $"Comando '{command}' procesado por núcleo C#.";
            }
        }
    }
}
