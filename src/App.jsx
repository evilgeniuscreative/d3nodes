import { searchUsers } from "./api"; // add this at the top

// inside useEffect:
useEffect(() => {
  if (!value) {
    setOptions([]);
    return;
  }

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const users = await searchUsers(value);
      setOptions(users);
    } catch (err) {
      console.error("Error searching GitHub users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchUsers();
}, [value]);
