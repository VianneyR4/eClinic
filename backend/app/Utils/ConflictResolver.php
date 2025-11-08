<?php

namespace App\Utils;

/**
 * Conflict Resolver Utility
 * 
 * Handles merge conflicts during data synchronization.
 * This is useful when syncing data from multiple sources (e.g., offline-first apps).
 */
class ConflictResolver
{
    /**
     * Resolve conflicts between two data sets using last-write-wins strategy.
     * 
     * @param array $localData Local data
     * @param array $remoteData Remote data
     * @return array Resolved data
     */
    public static function resolveLastWriteWins(array $localData, array $remoteData): array
    {
        $localTimestamp = $localData['updated_at'] ?? $localData['created_at'] ?? null;
        $remoteTimestamp = $remoteData['updated_at'] ?? $remoteData['created_at'] ?? null;

        if (!$localTimestamp) {
            return $remoteData;
        }

        if (!$remoteTimestamp) {
            return $localData;
        }

        $localTime = is_string($localTimestamp) ? strtotime($localTimestamp) : $localTimestamp;
        $remoteTime = is_string($remoteTimestamp) ? strtotime($remoteTimestamp) : $remoteTimestamp;

        return $remoteTime >= $localTime ? $remoteData : $localData;
    }

    /**
     * Resolve conflicts by merging data intelligently.
     * 
     * @param array $localData Local data
     * @param array $remoteData Remote data
     * @return array Merged data
     */
    public static function resolveMerge(array $localData, array $remoteData): array
    {
        $merged = $localData;

        foreach ($remoteData as $key => $value) {
            if (!isset($merged[$key])) {
                $merged[$key] = $value;
            } elseif (is_array($merged[$key]) && is_array($value)) {
                $merged[$key] = self::resolveMerge($merged[$key], $value);
            } elseif (self::isNewer($remoteData, $localData, $key)) {
                $merged[$key] = $value;
            }
        }

        // Always use the latest timestamp
        if (isset($remoteData['updated_at'])) {
            $merged['updated_at'] = $remoteData['updated_at'];
        }

        return $merged;
    }

    /**
     * Check if remote value is newer than local value for a specific key.
     */
    protected static function isNewer(array $remoteData, array $localData, string $key): bool
    {
        $remoteTimestamp = $remoteData['updated_at'] ?? $remoteData['created_at'] ?? null;
        $localTimestamp = $localData['updated_at'] ?? $localData['created_at'] ?? null;

        if (!$remoteTimestamp || !$localTimestamp) {
            return false;
        }

        $remoteTime = is_string($remoteTimestamp) ? strtotime($remoteTimestamp) : $remoteTimestamp;
        $localTime = is_string($localTimestamp) ? strtotime($localTimestamp) : $localTimestamp;

        return $remoteTime > $localTime;
    }

    /**
     * Detect conflicts between two data sets.
     * 
     * @param array $localData Local data
     * @param array $remoteData Remote data
     * @return array List of conflicting keys
     */
    public static function detectConflicts(array $localData, array $remoteData): array
    {
        $conflicts = [];

        foreach ($localData as $key => $value) {
            if (isset($remoteData[$key]) && $remoteData[$key] !== $value) {
                if (is_array($value) && is_array($remoteData[$key])) {
                    $nestedConflicts = self::detectConflicts($value, $remoteData[$key]);
                    if (!empty($nestedConflicts)) {
                        $conflicts[$key] = $nestedConflicts;
                    }
                } else {
                    $conflicts[] = $key;
                }
            }
        }

        return $conflicts;
    }
}

