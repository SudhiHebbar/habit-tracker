using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using HabitTracker.Application.DTOs.Habit;
using HabitTracker.Application.Interfaces;
using HabitTracker.Application.Options;
using HabitTracker.Application.Services;
using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Repositories;
using AutoMapper;
using FluentValidation;
using FluentValidation.Results;

namespace HabitTracker.Tests.Unit.Services;

public class HabitServiceTests
{
    private readonly Mock<IHabitRepository> _mockHabitRepository;
    private readonly Mock<ITrackerRepository> _mockTrackerRepository;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<IValidator<CreateHabitDto>> _mockCreateValidator;
    private readonly Mock<IValidator<UpdateHabitDto>> _mockUpdateValidator;
    private readonly Mock<ILogger<HabitService>> _mockLogger;
    private readonly Mock<IOptions<HabitLimitsOptions>> _mockHabitLimitsOptions;
    private readonly HabitService _habitService;

    public HabitServiceTests()
    {
        _mockHabitRepository = new Mock<IHabitRepository>();
        _mockTrackerRepository = new Mock<ITrackerRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockMapper = new Mock<IMapper>();
        _mockCreateValidator = new Mock<IValidator<CreateHabitDto>>();
        _mockUpdateValidator = new Mock<IValidator<UpdateHabitDto>>();
        _mockLogger = new Mock<ILogger<HabitService>>();
        _mockHabitLimitsOptions = new Mock<IOptions<HabitLimitsOptions>>();
        
        // Setup default options
        _mockHabitLimitsOptions.Setup(x => x.Value).Returns(new HabitLimitsOptions
        {
            MaxHabitsPerTracker = 100,
            MaxTargetCount = 365,
            MinTargetCount = 1
        });

        _habitService = new HabitService(
            _mockHabitRepository.Object,
            _mockTrackerRepository.Object,
            _mockUnitOfWork.Object,
            _mockMapper.Object,
            _mockCreateValidator.Object,
            _mockUpdateValidator.Object,
            _mockLogger.Object,
            _mockHabitLimitsOptions.Object
        );
    }

    #region GetHabitsByTrackerAsync Tests

    [Fact]
    public async Task GetHabitsByTrackerAsync_WithValidTrackerId_ShouldReturnMappedHabits()
    {
        // Arrange
        var trackerId = 1;
        var habits = new List<Habit>
        {
            new Habit { Id = 1, TrackerId = trackerId, Name = "Test Habit 1", IsActive = true },
            new Habit { Id = 2, TrackerId = trackerId, Name = "Test Habit 2", IsActive = true }
        };
        var habitDtos = new List<HabitResponseDto>
        {
            new HabitResponseDto { Id = 1, Name = "Test Habit 1" },
            new HabitResponseDto { Id = 2, Name = "Test Habit 2" }
        };

        _mockHabitRepository.Setup(x => x.GetHabitsByTrackerAsync(trackerId))
            .ReturnsAsync(habits);
        _mockMapper.Setup(x => x.Map<IEnumerable<HabitResponseDto>>(habits))
            .Returns(habitDtos);

        // Act
        var result = await _habitService.GetHabitsByTrackerAsync(trackerId);

        // Assert
        result.Should().BeEquivalentTo(habitDtos);
        _mockHabitRepository.Verify(x => x.GetHabitsByTrackerAsync(trackerId), Times.Once);
        _mockMapper.Verify(x => x.Map<IEnumerable<HabitResponseDto>>(habits), Times.Once);
    }

    [Fact]
    public async Task GetHabitsByTrackerAsync_WithInvalidTrackerId_ShouldReturnEmptyList()
    {
        // Arrange
        var trackerId = 999;
        var emptyHabits = new List<Habit>();
        var emptyDtos = new List<HabitResponseDto>();

        _mockHabitRepository.Setup(x => x.GetHabitsByTrackerAsync(trackerId))
            .ReturnsAsync(emptyHabits);
        _mockMapper.Setup(x => x.Map<IEnumerable<HabitResponseDto>>(emptyHabits))
            .Returns(emptyDtos);

        // Act
        var result = await _habitService.GetHabitsByTrackerAsync(trackerId);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetHabitByIdAsync Tests

    [Fact]
    public async Task GetHabitByIdAsync_WithValidId_ShouldReturnMappedHabit()
    {
        // Arrange
        var habitId = 1;
        var habit = new Habit { Id = habitId, Name = "Test Habit", IsActive = true };
        var habitDto = new HabitResponseDto { Id = habitId, Name = "Test Habit" };

        _mockHabitRepository.Setup(x => x.GetByIdAsync(habitId))
            .ReturnsAsync(habit);
        _mockMapper.Setup(x => x.Map<HabitResponseDto>(habit))
            .Returns(habitDto);

        // Act
        var result = await _habitService.GetHabitByIdAsync(habitId);

        // Assert
        result.Should().BeEquivalentTo(habitDto);
    }

    [Fact]
    public async Task GetHabitByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        // Arrange
        var habitId = 999;
        _mockHabitRepository.Setup(x => x.GetByIdAsync(habitId))
            .ReturnsAsync((Habit)null);

        // Act
        var result = await _habitService.GetHabitByIdAsync(habitId);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateHabitAsync Tests

    [Fact]
    public async Task CreateHabitAsync_WithValidData_ShouldCreateAndReturnHabit()
    {
        // Arrange
        var trackerId = 1;
        var createDto = new CreateHabitDto
        {
            Name = "New Habit",
            Description = "Test description",
            TargetFrequency = "Daily",
            TargetCount = 1,
            Color = "#FF0000",
            DisplayOrder = 0
        };
        var tracker = new Tracker { Id = trackerId, Name = "Test Tracker", IsActive = true };
        var habit = new Habit
        {
            Id = 1,
            TrackerId = trackerId,
            Name = createDto.Name,
            Description = createDto.Description,
            IsActive = true
        };
        var habitDto = new HabitResponseDto { Id = 1, Name = "New Habit" };

        _mockCreateValidator.Setup(x => x.ValidateAsync(createDto, default))
            .ReturnsAsync(new ValidationResult());
        _mockTrackerRepository.Setup(x => x.GetByIdAsync(trackerId))
            .ReturnsAsync(tracker);
        _mockHabitRepository.Setup(x => x.IsNameUniqueInTrackerAsync(createDto.Name, trackerId))
            .ReturnsAsync(true);
        _mockMapper.Setup(x => x.Map<Habit>(createDto))
            .Returns(habit);
        _mockHabitRepository.Setup(x => x.AddAsync(It.IsAny<Habit>()))
            .ReturnsAsync(habit);
        _mockMapper.Setup(x => x.Map<HabitResponseDto>(habit))
            .Returns(habitDto);

        // Act
        var result = await _habitService.CreateHabitAsync(trackerId, createDto);

        // Assert
        result.Should().BeEquivalentTo(habitDto);
        _mockHabitRepository.Verify(x => x.AddAsync(It.IsAny<Habit>()), Times.Once);
    }

    [Fact]
    public async Task CreateHabitAsync_WithInvalidDto_ShouldThrowValidationException()
    {
        // Arrange
        var trackerId = 1;
        var createDto = new CreateHabitDto { Name = "" }; // Invalid name
        var validationFailures = new List<ValidationFailure>
        {
            new ValidationFailure("Name", "Name is required")
        };
        var validationResult = new ValidationResult(validationFailures);

        _mockCreateValidator.Setup(x => x.ValidateAsync(createDto, default))
            .ReturnsAsync(validationResult);

        // Act & Assert
        await _habitService.Invoking(x => x.CreateHabitAsync(trackerId, createDto))
            .Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task CreateHabitAsync_WithNonExistentTracker_ShouldThrowArgumentException()
    {
        // Arrange
        var trackerId = 999;
        var createDto = new CreateHabitDto { Name = "Test Habit" };

        _mockCreateValidator.Setup(x => x.ValidateAsync(createDto, default))
            .ReturnsAsync(new ValidationResult());
        _mockTrackerRepository.Setup(x => x.GetByIdAsync(trackerId))
            .ReturnsAsync((Tracker)null);

        // Act & Assert
        await _habitService.Invoking(x => x.CreateHabitAsync(trackerId, createDto))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage($"Tracker with ID {trackerId} not found");
    }

    [Fact]
    public async Task CreateHabitAsync_WithDuplicateName_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var trackerId = 1;
        var createDto = new CreateHabitDto { Name = "Existing Habit" };
        var tracker = new Tracker { Id = trackerId, Name = "Test Tracker", IsActive = true };

        _mockCreateValidator.Setup(x => x.ValidateAsync(createDto, default))
            .ReturnsAsync(new ValidationResult());
        _mockTrackerRepository.Setup(x => x.GetByIdAsync(trackerId))
            .ReturnsAsync(tracker);
        _mockHabitRepository.Setup(x => x.IsNameUniqueInTrackerAsync(createDto.Name, trackerId))
            .ReturnsAsync(false);

        // Act & Assert
        await _habitService.Invoking(x => x.CreateHabitAsync(trackerId, createDto))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"A habit with the name '{createDto.Name}' already exists in this tracker");
    }

    #endregion

    #region UpdateHabitAsync Tests

    [Fact]
    public async Task UpdateHabitAsync_WithValidData_ShouldUpdateAndReturnHabit()
    {
        // Arrange
        var habitId = 1;
        var updateDto = new UpdateHabitDto
        {
            Name = "Updated Habit",
            Description = "Updated description",
            TargetFrequency = "Weekly",
            TargetCount = 2,
            Color = "#00FF00",
            DisplayOrder = 1,
            IsActive = true
        };
        var existingHabit = new Habit
        {
            Id = habitId,
            TrackerId = 1,
            Name = "Original Habit",
            IsActive = true
        };
        var updatedHabit = new Habit
        {
            Id = habitId,
            TrackerId = 1,
            Name = updateDto.Name,
            Description = updateDto.Description,
            IsActive = true
        };
        var habitDto = new HabitResponseDto { Id = habitId, Name = "Updated Habit" };

        _mockUpdateValidator.Setup(x => x.ValidateAsync(updateDto, default))
            .ReturnsAsync(new ValidationResult());
        _mockHabitRepository.Setup(x => x.GetByIdAsync(habitId))
            .ReturnsAsync(existingHabit);
        _mockHabitRepository.Setup(x => x.IsNameUniqueInTrackerAsync(updateDto.Name, existingHabit.TrackerId, habitId))
            .ReturnsAsync(true);
        _mockMapper.Setup(x => x.Map(updateDto, existingHabit))
            .Returns(updatedHabit);
        _mockHabitRepository.Setup(x => x.UpdateAsync(existingHabit))
            .ReturnsAsync(updatedHabit);
        _mockMapper.Setup(x => x.Map<HabitResponseDto>(updatedHabit))
            .Returns(habitDto);

        // Act
        var result = await _habitService.UpdateHabitAsync(habitId, updateDto);

        // Assert
        result.Should().BeEquivalentTo(habitDto);
        _mockHabitRepository.Verify(x => x.UpdateAsync(existingHabit), Times.Once);
    }

    [Fact]
    public async Task UpdateHabitAsync_WithNonExistentHabit_ShouldThrowArgumentException()
    {
        // Arrange
        var habitId = 999;
        var updateDto = new UpdateHabitDto { Name = "Test Habit" };

        _mockUpdateValidator.Setup(x => x.ValidateAsync(updateDto, default))
            .ReturnsAsync(new ValidationResult());
        _mockHabitRepository.Setup(x => x.GetByIdAsync(habitId))
            .ReturnsAsync((Habit)null);

        // Act & Assert
        await _habitService.Invoking(x => x.UpdateHabitAsync(habitId, updateDto))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage($"Habit with ID {habitId} not found");
    }

    [Fact]
    public async Task UpdateHabitAsync_WithDuplicateName_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var habitId = 1;
        var updateDto = new UpdateHabitDto { Name = "Duplicate Name" };
        var existingHabit = new Habit
        {
            Id = habitId,
            TrackerId = 1,
            Name = "Original Name",
            IsActive = true
        };

        _mockUpdateValidator.Setup(x => x.ValidateAsync(updateDto, default))
            .ReturnsAsync(new ValidationResult());
        _mockHabitRepository.Setup(x => x.GetByIdAsync(habitId))
            .ReturnsAsync(existingHabit);
        _mockHabitRepository.Setup(x => x.IsNameUniqueInTrackerAsync(updateDto.Name, existingHabit.TrackerId, habitId))
            .ReturnsAsync(false);

        // Act & Assert
        await _habitService.Invoking(x => x.UpdateHabitAsync(habitId, updateDto))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"A habit with the name '{updateDto.Name}' already exists in this tracker");
    }

    #endregion

    #region DeleteHabitAsync Tests

    [Fact]
    public async Task DeleteHabitAsync_WithValidId_ShouldReturnTrue()
    {
        // Arrange
        var habitId = 1;
        var habit = new Habit { Id = habitId, Name = "Test Habit", IsActive = true };

        _mockHabitRepository.Setup(x => x.GetByIdAsync(habitId))
            .ReturnsAsync(habit);
        _mockHabitRepository.Setup(x => x.DeleteAsync(habitId))
            .ReturnsAsync(true);

        // Act
        var result = await _habitService.DeleteHabitAsync(habitId);

        // Assert
        result.Should().BeTrue();
        _mockHabitRepository.Verify(x => x.DeleteAsync(habitId), Times.Once);
    }

    [Fact]
    public async Task DeleteHabitAsync_WithNonExistentId_ShouldThrowArgumentException()
    {
        // Arrange
        var habitId = 999;
        _mockHabitRepository.Setup(x => x.GetByIdAsync(habitId))
            .ReturnsAsync((Habit)null);

        // Act & Assert
        await _habitService.Invoking(x => x.DeleteHabitAsync(habitId))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage($"Habit with ID {habitId} not found");
    }

    [Fact]
    public async Task DeleteHabitAsync_WhenRepositoryFails_ShouldReturnFalse()
    {
        // Arrange
        var habitId = 1;
        var habit = new Habit { Id = habitId, Name = "Test Habit", IsActive = true };

        _mockHabitRepository.Setup(x => x.GetByIdAsync(habitId))
            .ReturnsAsync(habit);
        _mockHabitRepository.Setup(x => x.DeleteAsync(habitId))
            .ReturnsAsync(false);

        // Act
        var result = await _habitService.DeleteHabitAsync(habitId);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region ValidateHabitNameAsync Tests

    [Fact]
    public async Task ValidateHabitNameAsync_WithUniqueName_ShouldReturnTrue()
    {
        // Arrange
        var name = "Unique Habit";
        var trackerId = 1;

        _mockHabitRepository.Setup(x => x.IsNameUniqueInTrackerAsync(name, trackerId))
            .ReturnsAsync(true);

        // Act
        var result = await _habitService.ValidateHabitNameAsync(name, trackerId);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task ValidateHabitNameAsync_WithDuplicateName_ShouldReturnFalse()
    {
        // Arrange
        var name = "Duplicate Habit";
        var trackerId = 1;

        _mockHabitRepository.Setup(x => x.IsNameUniqueInTrackerAsync(name, trackerId))
            .ReturnsAsync(false);

        // Act
        var result = await _habitService.ValidateHabitNameAsync(name, trackerId);

        // Assert
        result.IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task ValidateHabitNameAsync_WithInvalidName_ShouldReturnFalse(string name)
    {
        // Arrange
        var trackerId = 1;

        // Act
        var result = await _habitService.ValidateHabitNameAsync(name, trackerId);

        // Assert
        result.IsValid.Should().BeFalse();
    }

    #endregion

    #region Business Logic Tests

    [Fact]
    public async Task CreateHabitAsync_ShouldSetCreationTimestamp()
    {
        // Arrange
        var trackerId = 1;
        var createDto = new CreateHabitDto { Name = "Time Test Habit" };
        var tracker = new Tracker { Id = trackerId, Name = "Test Tracker", IsActive = true };
        var habit = new Habit { Id = 1, Name = "Time Test Habit" };

        _mockCreateValidator.Setup(x => x.ValidateAsync(createDto, default))
            .ReturnsAsync(new ValidationResult());
        _mockTrackerRepository.Setup(x => x.GetByIdAsync(trackerId))
            .ReturnsAsync(tracker);
        _mockHabitRepository.Setup(x => x.IsNameUniqueInTrackerAsync(createDto.Name, trackerId))
            .ReturnsAsync(true);
        _mockMapper.Setup(x => x.Map<Habit>(createDto))
            .Returns(habit);

        // Act
        await _habitService.CreateHabitAsync(trackerId, createDto);

        // Assert
        _mockHabitRepository.Verify(x => x.AddAsync(It.Is<Habit>(h => 
            h.TrackerId == trackerId && 
            h.CreatedAt > DateTime.UtcNow.AddMinutes(-1) && 
            h.CreatedAt <= DateTime.UtcNow)), Times.Once);
    }

    [Theory]
    [InlineData("Daily", 1)]
    [InlineData("Weekly", 1)]
    [InlineData("Custom", 3)]
    public async Task CreateHabitAsync_ShouldSetDefaultValuesBasedOnFrequency(string frequency, int expectedTargetCount)
    {
        // Arrange
        var trackerId = 1;
        var createDto = new CreateHabitDto 
        { 
            Name = "Frequency Test Habit",
            TargetFrequency = frequency
        };
        var tracker = new Tracker { Id = trackerId, Name = "Test Tracker", IsActive = true };

        _mockCreateValidator.Setup(x => x.ValidateAsync(createDto, default))
            .ReturnsAsync(new ValidationResult());
        _mockTrackerRepository.Setup(x => x.GetByIdAsync(trackerId))
            .ReturnsAsync(tracker);
        _mockHabitRepository.Setup(x => x.IsNameUniqueInTrackerAsync(createDto.Name, trackerId))
            .ReturnsAsync(true);

        // Act
        await _habitService.CreateHabitAsync(trackerId, createDto);

        // Assert
        _mockMapper.Verify(x => x.Map<Habit>(It.Is<CreateHabitDto>(dto => 
            dto.TargetFrequency == frequency)), Times.Once);
    }

    #endregion
}