using AutoMapper;
using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Application.Interfaces;
using HabitTracker.Application.Options;
using HabitTracker.Application.Services;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace HabitTracker.Tests.Unit.Services;

public class TrackerServiceTests
{
    private readonly ITrackerRepository _mockRepository;
    private readonly IMapper _mockMapper;
    private readonly IValidator<CreateTrackerDto> _mockCreateValidator;
    private readonly IValidator<UpdateTrackerDto> _mockUpdateValidator;
    private readonly ILogger<TrackerService> _mockLogger;
    private readonly IOptions<TrackerLimitsOptions> _mockTrackerLimitsOptions;
    private readonly TrackerService _service;

    public TrackerServiceTests()
    {
        _mockRepository = Substitute.For<ITrackerRepository>();
        _mockMapper = Substitute.For<IMapper>();
        _mockCreateValidator = Substitute.For<IValidator<CreateTrackerDto>>();
        _mockUpdateValidator = Substitute.For<IValidator<UpdateTrackerDto>>();
        _mockLogger = Substitute.For<ILogger<TrackerService>>();
        
        var trackerLimitsOptions = new TrackerLimitsOptions
        {
            MaxTrackersPerUser = 20,
            MaxHabitsPerTracker = 100,
            MaxTrackerNameLength = 100,
            MaxTrackerDescriptionLength = 500
        };
        _mockTrackerLimitsOptions = Substitute.For<IOptions<TrackerLimitsOptions>>();
        _mockTrackerLimitsOptions.Value.Returns(trackerLimitsOptions);
        
        _service = new TrackerService(
            _mockRepository, 
            _mockMapper, 
            _mockCreateValidator, 
            _mockUpdateValidator, 
            _mockLogger,
            _mockTrackerLimitsOptions);
    }

    [Fact]
    public async Task GetAllTrackersAsync_ShouldReturnMappedTrackers_WhenTrackersExist()
    {
        // Arrange
        const string userId = "user123";
        var trackers = new List<Tracker>
        {
            new() { Id = 1, Name = "Fitness", UserId = userId },
            new() { Id = 2, Name = "Study", UserId = userId }
        };
        var trackerDtos = new List<TrackerResponseDto>
        {
            new() { Id = 1, Name = "Fitness", HabitCount = 5 },
            new() { Id = 2, Name = "Study", HabitCount = 3 }
        };

        _mockRepository.GetTrackersByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(trackers);
        _mockMapper.Map<IEnumerable<TrackerResponseDto>>(trackers)
            .Returns(trackerDtos);
        _mockRepository.GetActiveHabitCountAsync(1, Arg.Any<CancellationToken>())
            .Returns(5);
        _mockRepository.GetActiveHabitCountAsync(2, Arg.Any<CancellationToken>())
            .Returns(3);

        // Act
        var result = await _service.GetAllTrackersAsync(userId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(trackerDtos);
        await _mockRepository.Received(1).GetTrackersByUserIdAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetActiveTrackersAsync_ShouldReturnOrderedActiveTrackers()
    {
        // Arrange
        const string userId = "user123";
        var trackers = new List<Tracker>
        {
            new() { Id = 1, Name = "Fitness", DisplayOrder = 2, UserId = userId },
            new() { Id = 2, Name = "Study", DisplayOrder = 1, UserId = userId }
        };
        var trackerDtos = new List<TrackerResponseDto>
        {
            new() { Id = 2, Name = "Study", DisplayOrder = 1, HabitCount = 3 },
            new() { Id = 1, Name = "Fitness", DisplayOrder = 2, HabitCount = 5 }
        };

        _mockRepository.GetActiveTrackersByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(trackers);
        _mockMapper.Map<IEnumerable<TrackerResponseDto>>(trackers)
            .Returns(trackerDtos);
        _mockRepository.GetActiveHabitCountAsync(Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(0);

        // Act
        var result = await _service.GetActiveTrackersAsync(userId);

        // Assert
        result.Should().BeInAscendingOrder(t => t.DisplayOrder);
    }

    [Fact]
    public async Task GetTrackerByIdAsync_ShouldReturnTracker_WhenUserHasAccess()
    {
        // Arrange
        const string userId = "user123";
        const int trackerId = 1;
        var tracker = new Tracker 
        { 
            Id = trackerId, 
            Name = "Fitness", 
            UserId = userId,
            Habits = new List<Habit> { new() { IsActive = true }, new() { IsActive = false } }
        };
        var trackerDto = new TrackerResponseDto { Id = trackerId, Name = "Fitness", HabitCount = 1 };

        _mockRepository.CanUserAccessTrackerAsync(userId, trackerId, Arg.Any<CancellationToken>())
            .Returns(true);
        _mockRepository.GetTrackerWithHabitsAsync(trackerId, Arg.Any<CancellationToken>())
            .Returns(tracker);
        _mockMapper.Map<TrackerResponseDto>(tracker)
            .Returns(trackerDto);

        // Act
        var result = await _service.GetTrackerByIdAsync(trackerId, userId);

        // Assert
        result.Should().NotBeNull();
        result!.HabitCount.Should().Be(1);
    }

    [Fact]
    public async Task GetTrackerByIdAsync_ShouldReturnNull_WhenUserHasNoAccess()
    {
        // Arrange
        const string userId = "user123";
        const int trackerId = 1;

        _mockRepository.CanUserAccessTrackerAsync(userId, trackerId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await _service.GetTrackerByIdAsync(trackerId, userId);

        // Assert
        result.Should().BeNull();
        await _mockRepository.DidNotReceive().GetTrackerWithHabitsAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateTrackerAsync_ShouldCreateTracker_WhenValidRequest()
    {
        // Arrange
        const string userId = "user123";
        var createDto = new CreateTrackerDto { Name = "Fitness", Description = "Track fitness" };
        var tracker = new Tracker { Id = 1, Name = "Fitness", UserId = userId };
        var responseDto = new TrackerResponseDto { Id = 1, Name = "Fitness", HabitCount = 0 };
        var validationResult = new ValidationResult();

        _mockCreateValidator.ValidateAsync(createDto, Arg.Any<CancellationToken>())
            .Returns(validationResult);
        _mockRepository.GetActiveTrackersByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(new List<Tracker>());
        _mockRepository.IsTrackerNameUniqueForUserAsync(userId, createDto.Name, null, Arg.Any<CancellationToken>())
            .Returns(true);
        _mockMapper.Map<Tracker>(createDto)
            .Returns(tracker);
        _mockMapper.Map<TrackerResponseDto>(tracker)
            .Returns(responseDto);

        // Act
        var result = await _service.CreateTrackerAsync(createDto, userId);

        // Assert
        result.Should().BeEquivalentTo(responseDto);
        await _mockRepository.Received(1).AddAsync(Arg.Is<Tracker>(t => 
            t.Name == createDto.Name && 
            t.UserId == userId && 
            t.IsActive), Arg.Any<CancellationToken>());
        await _mockRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateTrackerAsync_ShouldThrowValidationException_WhenValidationFails()
    {
        // Arrange
        var createDto = new CreateTrackerDto { Name = "", Description = "Track fitness" };
        var validationFailures = new List<ValidationFailure> 
        { 
            new("Name", "Name is required") 
        };
        var validationResult = new ValidationResult(validationFailures);

        _mockCreateValidator.ValidateAsync(createDto, Arg.Any<CancellationToken>())
            .Returns(validationResult);

        // Act & Assert
        await _service.Invoking(s => s.CreateTrackerAsync(createDto, "user123"))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("*Name is required*");
    }

    [Fact]
    public async Task CreateTrackerAsync_ShouldThrowInvalidOperationException_WhenMaxTrackersReached()
    {
        // Arrange
        const string userId = "user123";
        var createDto = new CreateTrackerDto { Name = "Fitness", Description = "Track fitness" };
        var validationResult = new ValidationResult();
        var existingTrackers = Enumerable.Range(1, 20).Select(i => new Tracker()).ToList();

        _mockCreateValidator.ValidateAsync(createDto, Arg.Any<CancellationToken>())
            .Returns(validationResult);
        _mockRepository.GetActiveTrackersByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(existingTrackers);

        // Act & Assert
        await _service.Invoking(s => s.CreateTrackerAsync(createDto, userId))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Maximum number of trackers*");
    }

    [Fact]
    public async Task CreateTrackerAsync_ShouldThrowInvalidOperationException_WhenNameNotUnique()
    {
        // Arrange
        const string userId = "user123";
        var createDto = new CreateTrackerDto { Name = "Fitness", Description = "Track fitness" };
        var validationResult = new ValidationResult();

        _mockCreateValidator.ValidateAsync(createDto, Arg.Any<CancellationToken>())
            .Returns(validationResult);
        _mockRepository.GetActiveTrackersByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(new List<Tracker>());
        _mockRepository.IsTrackerNameUniqueForUserAsync(userId, createDto.Name, null, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act & Assert
        await _service.Invoking(s => s.CreateTrackerAsync(createDto, userId))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task UpdateTrackerAsync_ShouldUpdateTracker_WhenValidRequest()
    {
        // Arrange
        const string userId = "user123";
        const int trackerId = 1;
        var updateDto = new UpdateTrackerDto { Name = "Updated Fitness", Description = "Updated description" };
        var tracker = new Tracker { Id = trackerId, Name = "Fitness", UserId = userId };
        var responseDto = new TrackerResponseDto { Id = trackerId, Name = "Updated Fitness" };
        var validationResult = new ValidationResult();

        _mockUpdateValidator.ValidateAsync(updateDto, Arg.Any<CancellationToken>())
            .Returns(validationResult);
        _mockRepository.CanUserAccessTrackerAsync(userId, trackerId, Arg.Any<CancellationToken>())
            .Returns(true);
        _mockRepository.GetByIdAsync(trackerId, Arg.Any<CancellationToken>())
            .Returns(tracker);
        _mockRepository.IsTrackerNameUniqueForUserAsync(userId, updateDto.Name, trackerId, Arg.Any<CancellationToken>())
            .Returns(true);
        _mockMapper.Map<TrackerResponseDto>(tracker)
            .Returns(responseDto);
        _mockRepository.GetActiveHabitCountAsync(trackerId, Arg.Any<CancellationToken>())
            .Returns(5);

        // Act
        var result = await _service.UpdateTrackerAsync(trackerId, updateDto, userId);

        // Assert
        result.Should().NotBeNull();
        _mockMapper.Received(1).Map(updateDto, tracker);
        await _mockRepository.Received(1).UpdateAsync(tracker, Arg.Any<CancellationToken>());
        await _mockRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateTrackerAsync_ShouldReturnNull_WhenUserHasNoAccess()
    {
        // Arrange
        const string userId = "user123";
        const int trackerId = 1;
        var updateDto = new UpdateTrackerDto { Name = "Updated Fitness" };
        var validationResult = new ValidationResult();

        _mockUpdateValidator.ValidateAsync(updateDto, Arg.Any<CancellationToken>())
            .Returns(validationResult);
        _mockRepository.CanUserAccessTrackerAsync(userId, trackerId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await _service.UpdateTrackerAsync(trackerId, updateDto, userId);

        // Assert
        result.Should().BeNull();
        await _mockRepository.DidNotReceive().GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteTrackerAsync_ShouldDeleteTracker_WhenUserHasAccess()
    {
        // Arrange
        const string userId = "user123";
        const int trackerId = 1;

        _mockRepository.CanUserAccessTrackerAsync(userId, trackerId, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await _service.DeleteTrackerAsync(trackerId, userId);

        // Assert
        result.Should().BeTrue();
        await _mockRepository.Received(1).SoftDeleteAsync(trackerId, Arg.Any<CancellationToken>());
        await _mockRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteTrackerAsync_ShouldReturnFalse_WhenUserHasNoAccess()
    {
        // Arrange
        const string userId = "user123";
        const int trackerId = 1;

        _mockRepository.CanUserAccessTrackerAsync(userId, trackerId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await _service.DeleteTrackerAsync(trackerId, userId);

        // Assert
        result.Should().BeFalse();
        await _mockRepository.DidNotReceive().SoftDeleteAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RestoreTrackerAsync_ShouldRestoreTracker_WhenUserHasAccess()
    {
        // Arrange
        const string userId = "user123";
        const int trackerId = 1;

        _mockRepository.CanUserAccessTrackerAsync(userId, trackerId, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await _service.RestoreTrackerAsync(trackerId, userId);

        // Assert
        result.Should().BeTrue();
        await _mockRepository.Received(1).RestoreAsync(trackerId, Arg.Any<CancellationToken>());
        await _mockRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSharedTrackersAsync_ShouldReturnSharedTrackers()
    {
        // Arrange
        var sharedTrackers = new List<Tracker>
        {
            new() { Id = 1, Name = "Public Fitness", IsShared = true },
            new() { Id = 2, Name = "Public Study", IsShared = true }
        };
        var trackerDtos = new List<TrackerResponseDto>
        {
            new() { Id = 1, Name = "Public Fitness", HabitCount = 3 },
            new() { Id = 2, Name = "Public Study", HabitCount = 2 }
        };

        _mockRepository.GetSharedTrackersAsync(Arg.Any<CancellationToken>())
            .Returns(sharedTrackers);
        _mockMapper.Map<IEnumerable<TrackerResponseDto>>(sharedTrackers)
            .Returns(trackerDtos);
        _mockRepository.GetActiveHabitCountAsync(Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(0);

        // Act
        var result = await _service.GetSharedTrackersAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(trackerDtos);
    }

    [Fact]
    public async Task UpdateDisplayOrderAsync_ShouldUpdateOrder_WhenUserHasAccessToAllTrackers()
    {
        // Arrange
        const string userId = "user123";
        var trackerOrders = new List<(int TrackerId, int DisplayOrder)>
        {
            (1, 0),
            (2, 1)
        };

        _mockRepository.CanUserAccessTrackerAsync(userId, 1, Arg.Any<CancellationToken>())
            .Returns(true);
        _mockRepository.CanUserAccessTrackerAsync(userId, 2, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await _service.UpdateDisplayOrderAsync(userId, trackerOrders);

        // Assert
        result.Should().BeTrue();
        await _mockRepository.Received(1).ReorderTrackersAsync(userId, trackerOrders, Arg.Any<CancellationToken>());
        await _mockRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateDisplayOrderAsync_ShouldReturnFalse_WhenUserLacksAccessToAnyTracker()
    {
        // Arrange
        const string userId = "user123";
        var trackerOrders = new List<(int TrackerId, int DisplayOrder)>
        {
            (1, 0),
            (2, 1)
        };

        _mockRepository.CanUserAccessTrackerAsync(userId, 1, Arg.Any<CancellationToken>())
            .Returns(true);
        _mockRepository.CanUserAccessTrackerAsync(userId, 2, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await _service.UpdateDisplayOrderAsync(userId, trackerOrders);

        // Assert
        result.Should().BeFalse();
        await _mockRepository.DidNotReceive().ReorderTrackersAsync(Arg.Any<string?>(), Arg.Any<List<(int TrackerId, int DisplayOrder)>>(), Arg.Any<CancellationToken>());
    }
}