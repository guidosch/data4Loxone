export interface MeteoOpenDataAPIStatus {
    apiAvailableStatusAsBoolean: boolean;
    apiDataUptoDateAsBoolean:    boolean;
    apiAvailableStatus:          number;
    apiDataUptoDate:             number;
    apiDataAgeInMinutes:         number;
}
