import { useState, useEffect } from "react";
import { Tabs, Tab } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function BudgetTracker() {
  const [activeTab, setActiveTab] = useState("income");
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ tag: "", amount: "", date: "" });
  const [tags, setTags] = useState({
    income: ["Salary", "Project Fees"],
    expense: ["Taxi Fee", "Housing Fee"],
  });

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    if (!newTransaction.tag || !newTransaction.amount || !newTransaction.date) return;
    const updatedTransactions = [...transactions, { ...newTransaction, type: activeTab }];
    setTransactions(updatedTransactions);
    setNewTransaction({ tag: "", amount: "", date: "" });
  };

  const deleteTransaction = (index) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <Tab value="income">Income</Tab>
        <Tab value="expense">Expense</Tab>
      </Tabs>
      <div className="mb-4">
        <Input
          placeholder="Tag"
          value={newTransaction.tag}
          onChange={(e) => setNewTransaction({ ...newTransaction, tag: e.target.value })}
        />
        <Input
          placeholder="Amount"
          type="number"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
        />
        <Input
          placeholder="Date"
          type="date"
          value={newTransaction.date}
          onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
        />
        <Button onClick={addTransaction} className="mt-2">Add Transaction</Button>
      </div>
      <div>
        {transactions.filter(t => t.type === activeTab).map((t, index) => (
          <Card key={index} className="mb-2">
            <CardContent className="flex justify-between">
              <div>
                <p className="font-bold">{t.tag}</p>
                <p>${t.amount}</p>
                <p>{t.date}</p>
              </div>
              <Button variant="destructive" onClick={() => deleteTransaction(index)}>Delete</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}