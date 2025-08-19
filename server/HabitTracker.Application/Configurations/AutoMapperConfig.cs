using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace HabitTracker.Application.Configurations
{
    public static class AutoMapperConfig
    {
        /// <summary>
        /// Configures AutoMapper by automatically discovering all mapping profiles in the Application assembly
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <returns>The service collection for chaining</returns>
        public static IServiceCollection ConfigureAutoMapper(this IServiceCollection services)
        {
            // Automatically discover all mapping profiles in the current assembly
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            
            return services;
        }
    }
}